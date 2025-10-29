import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import db from '../../../../../db/db.ts'
import { addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import { TEST_ORGANIZATION_UUIDS } from '../../../../_helpers/organizations.ts'
import { isUUID } from '../../../../../util/uuid.ts'
import randomPhoneNumber from '../../../../../mocks/randomPhoneNumber.ts'
import randomDemographics from '../../../../../mocks/randomDemographics.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { route } from '../../../../route.ts'

describe(
  '/app/organizations/[organization_id]/patients/[patient_id]/open_encounters/registration/personal',
  () => {
    afterAll(() => db.destroy())

    it('is accessed immediately after the start-registration process', async () => {
      const { fetchCheerio, fetchOk } = await addTestEmployeeWithSession(db, {
        profession: 'receptionist',
        registration_status: 'approved',
      })

      const $ = await fetchCheerio(
        `/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/start-registration`,
        {
          method: 'POST',
        },
      )

      assert($('input[name="first_names"]').length === 1)
      assert($('input[name="surname"]').length === 1)
      assert($('input[name="nonexistant"]').length === 0)

      const patient_id = $.url.match(
        /patients\/(.*)\/open_encounter\/registration\/personal/,
      )![1]
      assert(isUUID(patient_id))
      const demographics = randomDemographics('ZA')
      const phone_number = randomPhoneNumber()
      const body = new FormData()
      body.set('first_names', demographics.first_names)
      body.set('surname', demographics.surname)
      body.set('preferred_name', demographics.preferred_name)
      body.set('national_id_number', demographics.national_id_number)
      body.set('date_of_birth', demographics.date_of_birth)
      body.set('sex', demographics.sex)
      body.set('gender', demographics.gender)
      body.set('phone_number', phone_number)

      const response = await fetchOk($.url, {
        method: 'POST',
        body,
      })

      console.log('response.url', response.url)

      assertEquals(
        response.url,
        `${route}/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/${patient_id}/open_encounter/registration/this_visit`,
      )

      return response.body?.cancel()
    })
  },
)
