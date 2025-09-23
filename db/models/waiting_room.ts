import { assert } from 'std/assert/assert.ts'
import {
  ExtendedActionData,
  HealthWorkerEmployment,
  RenderedPatientOpenEncounter,
  RenderedWaitingRoom,
  TrxOrDb,
} from '../../types.ts'
import * as patient_encounters from './patient_encounters.ts'
import { hasName } from '../../util/haveNames.ts'
import sortBy from '../../util/sortBy.ts'
import { timeAgoDisplay } from '../../util/timeAgoDisplay.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import capitalize from '../../util/capitalize.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
import { departmentResponsibleForWorkflow } from '../../shared/departments.ts'
import { assertAll } from '../../util/assertAll.ts'
import { assertArrayEmpty, assertArrayNonEmpty } from '../../util/arraySize.ts'

export function asWaitingRoom(
  patient_encounter: RenderedPatientOpenEncounter,
  organization_employment: HealthWorkerEmployment,
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
    // appointment,
    // patient_encounter_id,
    // notes,
    // all_employees_seen,
  } = patient_encounter

  assert(hasName(patient), 'Patient must have a name')

  // const organizations_where_doctor = health_worker.employment.filter((e) =>
  //   e.roles.doctor?.registration_completed
  // )

  // const awaiting_review_step = review_steps.find(
  //   (step) => !step.completed,
  // )?.step

  // const can_review =
  //   reviewers.some((r) => r.health_worker_id === health_worker.id) || (
  //     !!requesting_organization_id &&
  //     organizations_where_doctor.some((e) =>
  //       e.organization.id === requesting_organization_id
  //     )
  //   )

  const target_treatment_time = priority?.target_treatment_time || null
  const priority_level = priority?.name || null
  const {
    department_name,
    current_workflow,
    next_workflow,
    employees: present_employees,
  } = status.patient_presence
  const next_workflow_status = next_workflow && workflows[next_workflow]
  const current_workflow_status = current_workflow &&
    workflows[current_workflow]

  let workflow_status_display: string
  if (current_workflow_status) {
    assertNotEquals(department_name, 'waiting room')
    assertEquals(current_workflow_status.workflow, current_workflow)
    assertNotEquals(current_workflow_status.status, 'not started')
    assertNotEquals(current_workflow_status.status, 'completed')
    assertArrayNonEmpty(current_workflow_status.employees)
    workflow_status_display =
      `${current_workflow_status.workflow} ${current_workflow_status.status}`
  } else {
    assertEquals(department_name, 'waiting room')
    assert(next_workflow_status)
    assertArrayEmpty(present_employees)
    workflow_status_display = `Awaiting ${next_workflow_status.workflow}`
  }

  const workflow_to_start = current_workflow_status?.workflow ||
    next_workflow_status?.workflow
  assert(workflow_to_start)

  const can_perform_action = organization_employment.departments.some(
    (department) =>
      departmentResponsibleForWorkflow(department.name, workflow_to_start),
  )

  const action: ExtendedActionData = {
    text: workflow_to_start,
    method: 'POST',
    href:
      `/app/organizations/${organization_employment.organization.id}/patients/${patient.id}/open_encounter/start-workflow?workflow=${workflow_to_start}`,
    disabled: !can_perform_action,
  }

  return {
    patient_encounter_id,
    patient,
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
  organization_employment: HealthWorkerEmployment,
): Promise<RenderedWaitingRoom[]> {
  const open_encounters = await patient_encounters.getOpen(
    trx,
    {
      organization_id: organization_employment.organization.id,
    },
  )

  assertAll(open_encounters, (encounter) => {
    assertEquals(
      encounter.organization.id,
      organization_employment.organization.id,
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
