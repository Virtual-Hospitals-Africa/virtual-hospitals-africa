import { assertEquals } from 'std/assert/assert_equals.ts'
import { PatientWorkflows, Workflow } from '../../db.d.ts'
import { workflowStepKey } from '../../shared/workflow.ts'
import {
  InsertShape,
  RenderedPatientEncounter,
  RenderedPatientOpenEncounter,
  TrxOrDb,
  WorkflowStatus,
} from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { blankSelection } from '../helpers.ts'
import { AlertWithActionsError } from '../../util/assertOr.ts'

export function completedStep(
  trx: TrxOrDb,
  { patient_workflow_id, workflow, step }: {
    patient_workflow_id: string
    workflow: Workflow
    step: string
  },
) {
  return trx.insertInto('patient_workflow_steps_completed')
    .values({
      patient_workflow_id,
      workflow_step: workflowStepKey(workflow, step),
    })
    .onConflict((oc) => oc.doNothing())
    .execute()
}

export async function completedWorkflow(
  trx: TrxOrDb,
  { patient_workflow_id }: {
    patient_workflow_id: string
  },
) {
  await trx.insertInto('patient_workflows_completed')
    .values({ id: patient_workflow_id })
    .onConflict((oc) => oc.doNothing())
    .execute()

  return { success: true }
}

/**
 * Starts the given workflow, adding the patient_encounter_employee if necessary
 */
export function start(
  trx: TrxOrDb,
  {
    encounter,
    existing_patient_encounter_employee_id,
    employment_id,
    workflow_status,
  }: {
    encounter: RenderedPatientEncounter
    existing_patient_encounter_employee_id: string | null
    employment_id: string
    workflow_status: WorkflowStatus
  },
) {
  const patient_encounter_employee_id =
    existing_patient_encounter_employee_id ||
    generateUUID()

  assertEquals(
    workflow_status.status,
    'not started',
    'TODO support restarting workflows or joining those in progress?',
  )

  return trx.with(
    'inserting_patient_encounter_employee',
    (qb) =>
      !existing_patient_encounter_employee_id
        ? qb.insertInto('patient_encounter_employees')
          .values({
            id: patient_encounter_employee_id,
            patient_encounter_id: encounter.patient_encounter_id,
            employment_id: employment_id,
          })
        : blankSelection(qb),
  )
    .insertInto('patient_workflows_started')
    .values({
      patient_encounter_employee_id,
      patient_workflow_id: workflow_status.patient_workflow_id,
    })
    .execute()
}

export function insert(
  trx: TrxOrDb,
  to_insert: InsertShape<PatientWorkflows>,
) {
  return trx.insertInto('patient_workflows')
    .values(to_insert).execute()
}

export class PresentWithAnotherPatientError extends AlertWithActionsError {
  constructor(encounter: RenderedPatientOpenEncounter) {
    super('Cannot register new patients while present with another patient', [
      {
        text: `Continue with ${encounter.patient.name}`,
        href:
          `/app/organizations/${encounter.organization.id}/patients/${encounter.patient.id}/open_encounter/${encounter.status.patient_presence.current_workflow}`,
      },
      {
        text: `${encounter.patient.name} is in the waiting room`,
        href:
          `/app/organizations/${encounter.organization.id}/patients/${encounter.patient.id}/open_encounter/move-to-waiting-room`,
        method: 'POST',
      },
    ])
  }
}

export function assertNoPresentEncounter(
  maybe_encounter: RenderedPatientOpenEncounter | null,
): asserts maybe_encounter is null {
  if (maybe_encounter) {
    throw new PresentWithAnotherPatientError(
      maybe_encounter,
    )
  }
}
