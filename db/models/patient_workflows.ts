import { DB, Workflow } from '../../db.d.ts'
import { workflowStepKey } from '../../shared/workflow.ts'
import { HealthWorkerOrganization, RenderedPatientEncounter, RenderedPatientOpenEncounter, TrxOrDb } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { blankSelection } from '../helpers.ts'
import { AlertWithActionsError } from '../../util/assertOr.ts'
import { InsertObject } from 'kysely'
import { pronoun } from '../../shared/sex_and_gender.ts'
import { preferredName } from '../../util/asNames.ts'
import findMatching from '../../util/findMatching.ts'
import { employeeDisplay } from '../../util/healthWorkerDisplay.ts'

export function* employeesPresentWithPatient(
  { status, all_employees_seen }: RenderedPatientOpenEncounter,
) {
  for (const patient_encounter_employee_id of status.patient_presence.present_with_patient_encounter_employee_ids) {
    yield findMatching(all_employees_seen, { patient_encounter_employee_id })
  }
}

export function otherEmployeePresentWithPatient(
  encounter: RenderedPatientOpenEncounter,
  organization_employment: HealthWorkerOrganization,
) {
  for (const employee of employeesPresentWithPatient(encounter)) {
    if (organization_employment.employment_id !== employee.employee_id) {
      return employee
    }
  }
}

export class PresentWithAnotherPatientError extends AlertWithActionsError {
  constructor(
    encounter: RenderedPatientOpenEncounter,
    organization_employment: HealthWorkerOrganization,
  ) {
    const { patient, organization, status } = encounter
    const other_employee = otherEmployeePresentWithPatient(encounter, organization_employment)

    super('You cannot register new patients while present with another patient', [
      {
        text: `Continue with ${preferredName(patient, 'patient')}`,
        href: `/app/organizations/${organization.id}/patients/${patient.id}/open_encounter/${status.patient_presence.current_workflow}`,
      },
      other_employee
        ? {
          text: `Leave ${pronoun(patient)} with ${employeeDisplay(other_employee).display_name}`,
          href: `/app/organizations/${organization.id}/patients/${patient.id}/open_encounter/leave-with-another`,
          method: 'POST',
        }
        : {
          text: `Move ${pronoun(patient)} to the waiting room`,
          href: `/app/organizations/${organization.id}/patients/${patient.id}/open_encounter/move-to-waiting-room`,
          method: 'POST',
        },
    ], 'warning')
  }
}
export function assertNoPresentEncounter(
  maybe_encounter: RenderedPatientOpenEncounter | null,
  organization_employment: HealthWorkerOrganization,
): asserts maybe_encounter is null {
  if (maybe_encounter) {
    throw new PresentWithAnotherPatientError(
      maybe_encounter,
      organization_employment,
    )
  }
}

export const patient_workflows = {
  completedStep(
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
  },
  async completedWorkflow(
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
  },
  start(
    trx: TrxOrDb,
    {
      encounter,
      employment_id,
      patient_workflow_id,
      existing_patient_encounter_employee_id,
    }: {
      encounter: RenderedPatientEncounter
      employment_id: string
      patient_workflow_id: string
      existing_patient_encounter_employee_id: string | null
    },
  ) {
    const patient_encounter_employee_id = existing_patient_encounter_employee_id ||
      generateUUID()

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
    ).with(
      'inserting_employment_presence',
      (qb) =>
        qb.insertInto('employment_presence')
          .values({
            id: employment_id,
            at_work: true,
            with_patient_id: encounter.patient.id,
          }).onConflict((oc) =>
            oc.column('id').doUpdateSet({
              at_work: true,
              with_patient_id: encounter.patient.id,
            })
          ),
    )
      .insertInto('patient_workflows_started')
      .values({
        patient_encounter_employee_id,
        patient_workflow_id,
      })
      .onConflict((oc) => oc.constraint('patient_workflows_started_once').doNothing())
      .execute()
  },
  insertMany(
    trx: TrxOrDb,
    to_insert:  InsertObject<
      DB,
      'patient_workflows'
    >[],
  ) {
    return trx.insertInto('patient_workflows')
      .values(to_insert).execute()
  },
  insertOne(
    trx: TrxOrDb,
    to_insert: InsertObject<DB, 'patient_workflows'>
  ) {
    return trx.
      insertInto('patient_workflows')
      .values(to_insert)
      .returning('id')
      .executeTakeFirstOrThrow()
  },
}
