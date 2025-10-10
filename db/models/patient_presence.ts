import { assert } from 'std/assert/assert.ts'
import {
  HealthWorkerEmployment,
  RenderedPatientOpenEncounter,
  TrxOrDb,
} from '../../types.ts'
import { Department, WORKFLOW_DEPARTMENTS } from '../../shared/departments.ts'
import { PatientPresence } from '../../db.d.ts'

/**
 * Move the patient to the waiting room if the health worker doesn't do the next workflow
 * Otherwise, the health worker remains with the patient to perform the next workflow
 */
export function updateForOpenEncounterAfterCompletingWorkflow(
  trx: TrxOrDb,
  encounter: RenderedPatientOpenEncounter,
  organization_employment: HealthWorkerEmployment,
) {
  const { next_workflow } = encounter.status.patient_presence
  assert(next_workflow)
  const next_department: Department = WORKFLOW_DEPARTMENTS[next_workflow]
  assert(next_department)
  const { non_admin_id } = organization_employment
  assert(non_admin_id)

  const patient_id = encounter.patient.id

  const employed_in_next_workflow_department = organization_employment
    .departments.some((
      department,
    ) => department.name === next_department)

  const next_patient_presence: Pick<
    PatientPresence,
    'department_name' | 'current_workflow' | 'next_workflow'
  > = employed_in_next_workflow_department
    ? {
      department_name: next_department,
      current_workflow: next_workflow,
      next_workflow: null,
    }
    : {
      department_name: 'waiting room',
      current_workflow: null,
      next_workflow,
    }

  return trx.with(
    'updating_employement_presence',
    (qb) =>
      qb.updateTable('employment_presence')
        .set({
          at_work: true,
          with_patient_id: employed_in_next_workflow_department
            ? patient_id
            : null,
        })
        .where('employment_presence.id', '=', non_admin_id),
  )
    .updateTable('patient_presence')
    .set(next_patient_presence)
    .where('patient_presence.id', '=', patient_id)
    .returningAll()
    .executeTakeFirstOrThrow()
}
