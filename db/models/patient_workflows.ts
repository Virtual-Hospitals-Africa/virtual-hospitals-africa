import { Workflow } from '../../db.d.ts'
import { workflowStepKey } from '../../shared/workflow.ts'
import {
  RenderedPatientEncounter,
  TrxOrDb,
  WorkflowStatus,
} from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { blankSelection } from '../helpers.ts'

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
    seeing_as_employment_id,
    workflow_status,
  }: {
    encounter: RenderedPatientEncounter
    existing_patient_encounter_employee_id: string | null
    seeing_as_employment_id: string
    workflow_status: WorkflowStatus
  },
) {
  const patient_encounter_employee_id =
    existing_patient_encounter_employee_id ||
    generateUUID()

  return trx.with(
    'inserting_patient_encounter_employee',
    (qb) =>
      !existing_patient_encounter_employee_id
        ? qb.insertInto('patient_encounter_employees')
          .values({
            id: patient_encounter_employee_id,
            patient_encounter_id: encounter.patient_encounter_id,
            employment_id: seeing_as_employment_id,
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
