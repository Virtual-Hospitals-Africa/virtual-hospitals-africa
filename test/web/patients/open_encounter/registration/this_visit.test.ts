import { afterAll, before, describe, it } from 'std/testing/bdd.ts'
import db from '../../../../../db/db.ts'
import * as employees from '../../../../../db/models/employees.ts'
import * as patients from '../../../../../db/models/patients.ts'
import { addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import {
  createTestOrganization,
  TEST_ORGANIZATION_UUIDS,
} from '../../../../_helpers/organizations.ts'
import randomDemographics from '../../../../../mocks/randomDemographics.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { route } from '../../../../route.ts'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import asFormData from '../../../../../util/asFormData.ts'
import { employeeOrganizationDepartmentNames } from '../../../../../shared/departments.ts'

describe(
  '/app/organizations/[organization_id]/patients/[patient_id]/open_encounters/registration/this_visit',
  () => {
    before(waitUntilTestServerUp)
    afterAll(() => db.destroy())

    it('is accessed immediately after the personal page and can continue with registration', async () => {
      const { fetchCheerio } = await addTestEmployeeWithSession(db, {
        profession: 'receptionist',
        registration_status: 'approved',
      })

      const $personal = await fetchCheerio(
        `/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/start-registration`,
        {
          method: 'POST',
        },
      )
      const patient_id =
        $personal.url.match(/patients\/(.*)\/open_encounter/)![1]

      const $this_visit = await fetchCheerio(
        $personal.url,
        {
          method: 'POST',
          body: asFormData(randomDemographics('ZA')),
        },
      )

      assertEquals(
        $this_visit.url,
        `${route}/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/${patient_id}/open_encounter/registration/this_visit`,
      )

      const values = $this_visit('[name=next_workflow]')
        .map((_i, el) => $this_visit(el).attr('value'))
        .get()

      assertEquals(values, [
        'continue_with_registration',
        'immediate_triage',
        'call_for_help',
      ])

      const $primary_care = await fetchCheerio(
        $this_visit.url,
        {
          method: 'POST',
          body: asFormData({
            next_workflow: 'continue_with_registration',
          }),
        },
      )

      assertEquals(
        $primary_care.url,
        `${route}/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/${patient_id}/open_encounter/registration/primary_care`,
      )
    })

    it('can route immediately to triage as a receptionist', async () => {
      const organization = await createTestOrganization(db)
      const { fetchCheerio, health_worker } = await addTestEmployeeWithSession(
        db,
        {
          profession: 'receptionist',
          registration_status: 'approved',
          organization_id: organization.id,
        },
      )

      const receptionist = await employees.getById(
        db,
        health_worker.employee_id,
      )
      const departments = employeeOrganizationDepartmentNames(receptionist)
      assertEquals(departments, ['reception'])

      const $personal = await fetchCheerio(
        `/app/organizations/${organization.id}/patients/start-registration`,
        {
          method: 'POST',
        },
      )
      const patient_id =
        $personal.url.match(/patients\/(.*)\/open_encounter/)![1]

      const $this_visit = await fetchCheerio(
        $personal.url,
        {
          method: 'POST',
          body: asFormData(randomDemographics('ZA')),
        },
      )

      assertEquals(
        $this_visit.url,
        `${route}/app/organizations/${organization.id}/patients/${patient_id}/open_encounter/registration/this_visit`,
      )

      const values = $this_visit('[name=next_workflow]')
        .map((_i, el) => $this_visit(el).attr('value'))
        .get()

      assertEquals(values, [
        'continue_with_registration',
        'immediate_triage',
        'call_for_help',
      ])

      const $waiting_room = await fetchCheerio(
        $this_visit.url,
        {
          method: 'POST',
          body: asFormData({
            next_workflow: 'immediate_triage',
          }),
        },
      )

      const waiting_room_url = new URL($waiting_room.url)
      assertEquals(
        waiting_room_url.pathname,
        `/app/organizations/${organization.id}/waiting_room`,
      )

      assertEquals(
        Array.from(waiting_room_url.searchParams.keys()),
        ['success'],
      )

      const patient = await patients.getById(db, patient_id)

      const hardcoded_senior_health_care_professional_name = 'Nomsa Moyo'
      assertEquals(
        waiting_room_url.searchParams.get('success'),
        `${
          patient.names!.preferred_name
        } has been moved to triage and ${hardcoded_senior_health_care_professional_name} has been notified.`,
      )
    })

    it('can route immediately to triage as a nurse', async () => {
      const organization = await createTestOrganization(db)
      const { fetchCheerio, health_worker } = await addTestEmployeeWithSession(
        db,
        {
          profession: 'nurse',
          registration_status: 'approved',
          organization_id: organization.id,
        },
      )

      const nurse = await employees.getById(
        db,
        health_worker.employee_id,
      )
      const departments = employeeOrganizationDepartmentNames(nurse)
      assertEquals(departments, ['primary care', 'reception', 'triage'])

      const $personal = await fetchCheerio(
        `/app/organizations/${organization.id}/patients/start-registration`,
        {
          method: 'POST',
        },
      )
      const patient_id =
        $personal.url.match(/patients\/(.*)\/open_encounter/)![1]

      const $this_visit = await fetchCheerio(
        $personal.url,
        {
          method: 'POST',
          body: asFormData(randomDemographics('ZA')),
        },
      )

      const $triage_brief_history = await fetchCheerio(
        $this_visit.url,
        {
          method: 'POST',
          body: asFormData({
            next_workflow: 'immediate_triage',
          }),
        },
      )

      const triage_brief_history_url = new URL($triage_brief_history.url)
      assertEquals(
        triage_brief_history_url.pathname,
        `/app/organizations/${organization.id}/patients/${patient_id}/open_encounter/triage/brief_history`,
      )
    })
  },
)
