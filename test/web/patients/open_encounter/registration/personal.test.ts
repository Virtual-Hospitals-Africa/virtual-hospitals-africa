import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import db from '../../../../../db/db.ts'
import { addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import { TEST_ORGANIZATION_UUIDS } from '../../../../_helpers/organizations.ts'
import { isUUID } from '../../../../../util/uuid.ts'
import randomNationalId from '../../../../../mocks/randomNationalId.ts'
import randomPhoneNumber from '../../../../../mocks/randomPhoneNumber.ts'
import randomNamesAndSex from '../../../../../mocks/randomNamesAndSex.ts'

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

      console.log('$.url', $.url)
      const patient_id = $.url.match(
        /patients\/(.*)\/open_encounter\/registration\/personal/,
      )![1]
      assert(isUUID(patient_id))
      const date_of_birth = '2001-04-03'
      const demographics = randomNamesAndSex('ZA')
      const national_id_number = randomNationalId({
        sex: demographics.sex,
        date_of_birth,
      })
      const phone_number = randomPhoneNumber()
      const body = new FormData()
      body.set('first_names', demographics.first_names)
      body.set('surname', demographics.surname)
      body.set('preferred_name', demographics.surname)
      body.set('national_id_number', national_id_number)
      body.set('date_of_birth', date_of_birth)
      body.set('sex', demographics.sex)
      body.set('phone_number', phone_number)

      const response = await fetchOk($.url, {
        method: 'POST',
        body,
      })

      assert(response.url.endsWith('/'))

      return response.body?.cancel()
    })
  },
)
