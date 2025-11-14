import { assert } from 'std/assert/assert.ts'
import {
  ExtendedActionData,
  HealthWorkerOrganization,
  RenderedPatientOpenEncounter,
  RenderedWaitingRoom,
  TrxOrDb,
} from '../../types.ts'
import * as patient_encounters from './patient_encounters.ts'
import sortBy from '../../util/sortBy.ts'
import { timeAgoDisplay } from '../../util/timeAgoDisplay.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import capitalize from '../../util/capitalize.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
import {
  Department,
  departmentResponsibleForWorkflow,
} from '../../shared/departments.ts'
import { assertAll } from '../../util/assertAll.ts'
import { assertArrayEmpty, assertArrayNonEmpty } from '../../util/arraySize.ts'

export function asWaitingRoom(
  patient_encounter: RenderedPatientOpenEncounter,
  organization_employment: HealthWorkerOrganization,
): RenderedWaitingRoom {
  const {
    patient_encounter_id,
    reason,
    patient,
    priority,
    status,
    wait_time,
    arrived_timestamp,
    workflows,
    all_employees_seen,
    // appointment,
    // patient_encounter_id,
    // notes,
  } = patient_encounter

  // const organizations_where_doctor = health_worker.organizations.filter((e) =>
  //   e.roles.doctor?.registration_completed
  // )

  // const awaiting_review_step = review_steps.find(
  //   (step) => !step.completed,
  // )?.step

  // const can_review =
  //   reviewers.some((r) => r.health_worker_id === health_worker.id) || (
  //     !!requesting_organization_id &&
  //     organizations_where_doctor.some((e) =>
  //       o.id === requesting_organization_id
  //     )
  //   )

  const target_treatment_time = priority?.target_treatment_time || null
  const priority_level = priority?.name || null
  const {
    department_name,
    current_workflow,
    next_workflow,
    present_with_patient_encounter_employee_ids,
  } = status.patient_presence

  const present_employees = all_employees_seen.filter((employee) =>
    (present_with_patient_encounter_employee_ids as string[]).includes(
      employee.patient_encounter_employee_id,
    )
  )

  const next_workflow_status = next_workflow && workflows[next_workflow]
  const current_workflow_status = current_workflow &&
    workflows[current_workflow]

  let workflow_status_display: string
  if (current_workflow_status) {
    assertNotEquals(department_name, 'waiting room')
    assertEquals(current_workflow_status.workflow, current_workflow)
    assertNotEquals(current_workflow_status.status, 'not started')
    assertNotEquals(current_workflow_status.status, 'completed')
    assertArrayNonEmpty(
      current_workflow_status.seen_patient_encounter_employee_ids,
    )
    workflow_status_display =
      `${current_workflow_status.workflow} ${current_workflow_status.status}`
  } else {
    assertEquals(department_name, 'waiting room')
    assert(next_workflow_status)
    assertArrayEmpty(present_with_patient_encounter_employee_ids)
    workflow_status_display = `Awaiting ${next_workflow_status.workflow}`
  }

  const workflow_to_start = current_workflow_status?.workflow ||
    next_workflow_status?.workflow
  assert(workflow_to_start)

  const employment_departments = organization_employment.departments.filter(
    (d) => organization_employment.department_ids.includes(d.id),
  )
  const can_perform_action = employment_departments.some(
    (department) =>
      departmentResponsibleForWorkflow(
        department.name as Department,
        workflow_to_start,
      ),
  )

  const action: ExtendedActionData = {
    text: workflow_to_start,
    method: 'POST',
    href:
      `/app/organizations/${organization_employment.id}/patients/${patient.id}/open_encounter/start-workflow?workflow=${workflow_to_start}`,
    disabled: !can_perform_action,
  }

  return {
    patient_encounter_id,
    patient: {
      id: patient.id,
      avatar_url: patient.avatar_url,
      description: patient.description,
      name: patient.name || '[Unregistered patient]',
    },
    reason,
    priority_level,
    department_name,
    arrived_timestamp,
    target_treatment_time,
    present_employees,
    workflow_status_display: capitalize(workflow_status_display),
    arrived_ago_display: timeAgoDisplay(wait_time),
    actions: [action],
    // appointment,
    // reviewers,
  }
}

export async function get(
  trx: TrxOrDb,
  organization_employment: HealthWorkerOrganization,
): Promise<RenderedWaitingRoom[]> {
  const open_encounters = await patient_encounters.getOpen(
    trx,
    {
      organization_id: organization_employment.id,
    },
  )

  assertAll(open_encounters, (encounter) => {
    assertEquals(
      encounter.organization.id,
      organization_employment.id,
    )
  })

  const waiting_room_unsorted = open_encounters.map((encounter) =>
    asWaitingRoom(encounter, organization_employment)
  )

  return sortBy(
    waiting_room_unsorted,
    (row) => row.present_employees.length ? 1 : 0,
    (row) =>
      row.target_treatment_time ? row.target_treatment_time.valueOf() : -1,
    (row) => row.arrived_timestamp.valueOf(),
  )
}
