import { afterAll, before, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import db from '../../../../../db/db.ts'
import * as employees from '../../../../../db/models/employees.ts'
import { addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import { TEST_ORGANIZATION_UUIDS } from '../../../../_helpers/organizations.ts'
import { isUUID } from '../../../../../util/uuid.ts'
import randomPhoneNumber from '../../../../../mocks/randomPhoneNumber.ts'
import randomDemographics from '../../../../../mocks/randomDemographics.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { route } from '../../../../route.ts'
import { PatientRegistrationPersonalSchema } from '../../../../../routes/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/registration/personal.tsx'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import asFormData from '../../../../../util/asFormData.ts'
import { employeeOrganizationDepartmentNames, healthWorkerOrganizationDepartmentNames } from '../../../../../shared/departments.ts'

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
      const patient_id = $personal.url.match(/patients\/(.*)\/open_encounter/)![1]

      const $this_visit = await fetchCheerio(
        $personal.url,
        {
          method: 'POST',
          body: asFormData(randomDemographics('ZA'))
        },
      )

      assertEquals(
        $this_visit.url,
        `${route}/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/${patient_id}/open_encounter/registration/this_visit`,
      )

      const values = $this_visit('[name=next_workflow]').map((_i, el) => {
        return $this_visit(el).attr('value')
      }).get()

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
            next_workflow: 'continue_with_registration'
          })
        },
      )

      assertEquals(
        $primary_care.url,
        `${route}/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/${patient_id}/open_encounter/registration/primary_care`,
      )
    })

    it.only('is accessed immediately after the personal page and can proceed immediately to triage', async () => {
      const { fetchCheerio, health_worker } = await addTestEmployeeWithSession(db, {
        profession: 'receptionist',
        registration_status: 'approved',
      })

      const receptionist = await employees.getById(db, health_worker.employee_id)
      const departments = employeeOrganizationDepartmentNames(receptionist)
      assertEquals(departments, ['reception'])

      const $personal = await fetchCheerio(
        `/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/start-registration`,
        {
          method: 'POST',
        },
      )
      const patient_id = $personal.url.match(/patients\/(.*)\/open_encounter/)![1]

      const $this_visit = await fetchCheerio(
        $personal.url,
        {
          method: 'POST',
          body: asFormData(randomDemographics('ZA'))
        },
      )

      assertEquals(
        $this_visit.url,
        `${route}/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/${patient_id}/open_encounter/registration/this_visit`,
      )

      const values = $this_visit('[name=next_workflow]').map((_i, el) => {
        return $this_visit(el).attr('value')
      }).get()

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
            next_workflow: 'immediate_triage'
          })
        },
      )

      const primary_care_url = new URL($primary_care.url)
      assertEquals(
        primary_care_url.pathname,
        `/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/waiting_room`,
      )
      console.log(primary_care_url.searchParams)
    })
  },
)
