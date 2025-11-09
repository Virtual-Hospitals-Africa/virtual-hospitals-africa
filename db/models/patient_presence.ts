import { assert } from 'std/assert/assert.ts'
import {
  HealthWorkerOrganization,
  RenderedPatientOpenEncounter,
  TrxOrDb,
  UpdateShape,
} from '../../types.ts'
import { Department, WORKFLOW_DEPARTMENTS } from '../../shared/departments.ts'
import { PatientPresence } from '../../db.d.ts'
import { blankSelection } from '../helpers.ts'
import { nonAdminId } from '../../shared/nonAdminId.ts'

/**
 * Move the patient to the waiting room if the health worker doesn't do the next workflow
 * Otherwise, the health worker remains with the patient to perform the next workflow
 */
export function updateForOpenEncounterAfterCompletingWorkflow(
  trx: TrxOrDb,
  encounter: RenderedPatientOpenEncounter,
  organization_employment: HealthWorkerOrganization,
) {
  const { next_workflow } = encounter.status.patient_presence
  assert(next_workflow)
  const next_department: Department = WORKFLOW_DEPARTMENTS[next_workflow]
  assert(next_department)
  const non_admin_employment_id = nonAdminId(organization_employment)
  assert(non_admin_employment_id)

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

  const existing_patient_encounter_employee_id = encounter.all_employees_seen
    .find(
      (employee) => employee.employment_id === non_admin_employment_id,
    )?.patient_encounter_employee_id

  return trx.with(
    'insert_patient_workflows_started',
    (qb) =>
      next_patient_presence.current_workflow
        ? qb.insertInto('patient_workflows_started')
          .values({
            patient_workflow_id:
              encounter.workflows[next_patient_presence.current_workflow]!
                .patient_workflow_id,
            patient_encounter_employee_id:
              existing_patient_encounter_employee_id!,
          })
        : blankSelection(qb),
  )
    .with(
      'updating_employement_presence',
      (qb) =>
        qb.updateTable('employment_presence')
          .set({
            at_work: true,
            with_patient_id: employed_in_next_workflow_department
              ? patient_id
              : null,
          })
          .where('employment_presence.id', '=', non_admin_employment_id),
    )
    .updateTable('patient_presence')
    .set(next_patient_presence)
    .where('patient_presence.id', '=', patient_id)
    .returningAll()
    .executeTakeFirstOrThrow()
}

export function set(
  trx: TrxOrDb,
  patient_id: string,
  updates: UpdateShape<PatientPresence>,
) {
  return trx.updateTable('patient_presence')
    .set(updates).where('id', '=', patient_id)
    .executeTakeFirstOrThrow()
}
