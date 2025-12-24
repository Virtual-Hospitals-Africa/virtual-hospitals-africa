import { InsertShape, TrxOrDb } from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import generateUUID from '../../util/uuid.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import * as organizations from '../../db/models/organizations.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import * as patient_registration from '../../db/models/patient_registration.ts'
import * as patients from '../../db/models/patients.ts'
import * as patient_encounters from '../../db/models/patient_encounters.ts'
import { promiseProps } from '../../util/promiseProps.ts'
import { healthWorkerIdOfEmploymentId } from '../../db/models/health_worker_id.ts'
import {
  Workflow,
  WORKFLOW_STEPS,
  workflowStepKey,
} from '../../shared/workflow.ts'
import { PatientWorkflowStepsCompleted, Sex } from '../../db.d.ts'
import { completedWorkflow } from '../../db/models/patient_workflows.ts'
import randomDemographics from '../../mocks/randomDemographics.ts'
import assertLength from '../../util/assertLength.ts'

export async function insertRegistrationWithEmployeeForTest(
  trx: TrxOrDb,
  organization_id: string,
  { employment_id }: {
    employment_id: string
  },
) {
  assert(Deno.env.get('IS_TEST'))
  const { organization, health_worker } = await promiseProps({
    organization: organizations.getById(trx, organization_id),
    health_worker: health_workers.getEmployed(trx, {
      health_worker_id: healthWorkerIdOfEmploymentId(trx, employment_id),
    }),
  })
  const organization_employment = health_worker.organizations.find((o) =>
    o.id === organization_id
  )
  assert(organization_employment)

  const result = await patient_registration.start(
    trx,
    organization,
    organization_employment,
  )
  return {
    ...result,
    organization,
    organization_employment,
    health_worker,
  }
}

export function completeAllStepsForTest(
  trx: TrxOrDb,
  workflow: Workflow,
  patient_workflow_id: string,
) {
  assert(Deno.env.get('IS_TEST'))
  const steps = WORKFLOW_STEPS[workflow]
  const insert: InsertShape<PatientWorkflowStepsCompleted>[] = steps.map(
    (step) => ({
      patient_workflow_id,
      workflow_step: workflowStepKey(workflow, step),
    }),
  )
  return trx.insertInto('patient_workflow_steps_completed')
    .values(insert)
    .execute()
}

export type PartialPatientDemographics = {
  name?: string
  date_of_birth?: string
  sex?: Sex
  gender?: string
}

export async function insertPatientSeekingTreatmentWithEmployeeAndCompleteRegistrationForTest(
  trx: TrxOrDb,
  organization_id: string,
  { employment_id, patient_demographics }: {
    employment_id: string
    patient_demographics?: PartialPatientDemographics
  },
) {
  const {
    patient_id,
    patient_workflow_id,
    patient_encounter_id,
    organization,
    organization_employment,
    health_worker,
    success,
  } = await insertRegistrationWithEmployeeForTest(
    trx,
    organization_id,
    { employment_id },
  )
  assert(success)
  const patient_information = randomDemographics()
  if (patient_demographics) {
    Object.assign(patient_information, patient_demographics)
  }
  await Promise.all([
    patients.update(trx, {
      id: patient_id,
      ...patient_information,
      completed_registration: true,
    }),
    completeAllStepsForTest(
      trx,
      'registration',
      patient_workflow_id,
    ),
    completedWorkflow(trx, { patient_workflow_id }),
    patient_encounters.updateOne(trx, patient_encounter_id, {
      reason: 'seeking treatment',
    }),
  ])

  await patient_encounters.insertSeekingTreatmentForRegisteredPatient(
    trx,
    organization,
    organization_employment,
    {
      patient_id,
      encounter: {
        create: false,
        patient_encounter_id,
        existing: await patient_encounters.getById(trx, patient_encounter_id),
      },
    },
  )

  const encounter = await patient_encounters.getById(trx, patient_encounter_id)

  assertEquals(encounter.all_employees_seen.length, 1)

  return {
    ...encounter,
    employee: encounter.all_employees_seen[0],
    organization_employment,
    organization,
    health_worker,
  }
}

export async function insertReturningSeekingTreatmentWithEmployeeForTest(
  trx: TrxOrDb,
  organization_id: string,
  { patient_id, employment_id }: {
    patient_id: string
    employment_id: string
  },
) {
  assert(Deno.env.get('IS_TEST'))
  const { organization, health_worker } = await promiseProps({
    organization: organizations.getById(trx, organization_id),
    health_worker: health_workers.getEmployed(trx, {
      health_worker_id: healthWorkerIdOfEmploymentId(trx, employment_id),
    }),
  })
  const organization_employment = health_worker.organizations.find((o) =>
    o.id === organization_id
  )
  assert(organization_employment)

  const patient_presence = await patient_encounters
    .insertSeekingTreatmentForRegisteredPatient(
      trx,
      organization,
      organization_employment,
      {
        patient_id,
        encounter: {
          create: true,
          to_create: {
            reason: 'seeking treatment',
          },
          patient_encounter_id: generateUUID(),
        },
      },
    )

  const encounter = await patient_encounters.getById(
    trx,
    patient_presence.patient_encounter_id,
  )

  assertLength(encounter.all_employees_seen, 1)

  return {
    ...encounter,
    employee: encounter.all_employees_seen[0],
    organization_employment,
    organization,
    health_worker,
  }
}
