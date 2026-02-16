import { assert } from 'std/assert/assert.ts'
import {
  ExtendedActionData,
  HealthWorkerOrganization,
  RenderedOrganization,
  RenderedPatientOpenEncounter,
  RenderedWaitingRoom,
  TrxOrDbOrQueryCreator,
} from '../../types.ts'
import { patient_encounters } from './patient_encounters.ts'
import sortBy from '../../util/sortBy.ts'
import { timeAgoDisplay } from '../../util/timeAgoDisplay.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import capitalize from '../../util/capitalize.ts'
import { assertNotEquals } from 'std/assert/assert_not_equals.ts'
import { Department, departmentResponsibleForWorkflow } from '../../shared/departments.ts'
import { assertAll } from '../../util/assertAll.ts'
import { assertArrayEmpty } from '../../util/arraySize.ts'
import { InsertObject } from 'kysely'
import type { DB } from '../../db.d.ts'
import { exists } from '../../util/exists.ts'

function asWaitingRoom(
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
  const {
    department_name,
    current_workflow,
    next_workflow,
    present_with_patient_encounter_employee_ids,
    room,
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
    assertNotEquals(department_name, 'Waiting room')
    assertEquals(current_workflow_status.workflow, current_workflow)
    assertNotEquals(current_workflow_status.status, 'completed')
    workflow_status_display = `${current_workflow_status.workflow} ${current_workflow_status.status}`
  } else {
    assertEquals(department_name, 'Waiting room')
    assert(next_workflow_status)
    assertArrayEmpty(present_with_patient_encounter_employee_ids)
    workflow_status_display = `Awaiting ${next_workflow_status.workflow}`
  }

  const workflow_to_start = current_workflow_status?.workflow ||
    next_workflow_status?.workflow
  assert(workflow_to_start)

  const can_perform_action = organization_employment.in_departments.some(
    (department) =>
      departmentResponsibleForWorkflow(
        department.name as Department,
        workflow_to_start,
      ),
  )

  const action: ExtendedActionData = {
    text: workflow_to_start,
    method: 'POST',
    href: `/app/organizations/${organization_employment.id}/patients/${patient.id}/open_encounter/start-workflow?workflow=${workflow_to_start}`,
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
    room,
    reason,
    priority,
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

export const waiting_room = {
  asWaitingRoom,
  async get(
    trx: TrxOrDbOrQueryCreator,
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

    const waiting_room_unsorted = open_encounters.map((encounter) => asWaitingRoom(encounter, organization_employment))

    return sortBy(
      waiting_room_unsorted,
      (row) => row.present_employees.length ? 1 : 0,
      (row) => row.target_treatment_time ? new Date(row.target_treatment_time).valueOf() : -1,
      (row) => row.arrived_timestamp.valueOf(),
    )
  },
  async moveTo(
    trx: TrxOrDbOrQueryCreator,
    { organization, organization_employment, encounter }: {
      organization: RenderedOrganization
      organization_employment: HealthWorkerOrganization
      encounter: RenderedPatientOpenEncounter
    },
  ) {
    if (!encounter.status.patient_presence.current_workflow) return

    const patient_presence: InsertObject<DB, 'patient_presence'> = {
      id: encounter.patient.id,
      patient_encounter_id: encounter.patient_encounter_id,
      organization_id: organization.id,
      current_workflow: null,
      next_workflow: encounter.status.patient_presence.current_workflow,
      department_name: 'Waiting room',
      organization_room_id: exists(organization.waiting_room_id),
    }

    await trx.insertInto('patient_presence').values(
      patient_presence,
    )
      .onConflict((oc) => oc.column('id').doUpdateSet(patient_presence))
      .execute()

    assert(
      encounter.status.patient_presence
        .present_with_patient_encounter_employee_ids.length <= 1,
      "Moving patient to waiting room when other employees also with patient isn't supported",
    )
    const employee_present_with_patient = encounter.all_employees_seen.find(
      (employee) =>
        employee.patient_encounter_employee_id ===
          encounter.status.patient_presence
            .present_with_patient_encounter_employee_ids[0],
    )
    assert(employee_present_with_patient)

    const non_admin_employment_id = organization_employment.employment_id
    assert(non_admin_employment_id)
    assertEquals(
      employee_present_with_patient.employee_id,
      non_admin_employment_id,
    )

    const employment_presence: InsertObject<DB, 'employment_presence'> = {
      id: non_admin_employment_id,
      with_patient_id: null,
      at_work: true,
    }

    await trx.insertInto('employment_presence').values(
      employment_presence,
    )
      .onConflict((oc) => oc.column('id').doUpdateSet(employment_presence))
      .execute()
  },
}
