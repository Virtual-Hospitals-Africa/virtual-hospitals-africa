import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import db from '../../../../../db/db.ts'
import { addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import { TEST_ORGANIZATION_UUIDS } from '../../../../_helpers/organizations.ts'
import { isUUID } from '../../../../../util/uuid.ts'
import randomPhoneNumber from '../../../../../mocks/randomPhoneNumber.ts'
import randomDemographics from '../../../../../mocks/randomDemographics.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { route } from '../../../../_route.ts'
import { PatientRegistrationPersonalSchema } from '../../../../../routes/app/organizations/[organization_id]/patients/[patient_id]/open_encounter/registration/personal.tsx'
import waitUntilTestServerUp from '../../../../_helpers/waitUntilTestServerUp.ts'
import asFormData from '../../../../../util/asFormData.ts'

describeParallel(
  '/app/organizations/[organization_id]/patients/[patient_id]/open_encounters/registration/personal',
  () => {
    before(waitUntilTestServerUp)
    afterAll(() => db.destroy())

    itParallel('parses form data correctly', () => {
      const demographics = {
        first_names: 'Susara',
        surname: 'van der Merwe',
        preferred_name: 'Susara',
        national_id_number: '6810023055110',
        date_of_birth: '1968-10-02',
        sex: 'female' as const,
        gender: 'woman',
        preferred_language_code_iso_639_2_b: 'nso',
      }
      const parsed = PatientRegistrationPersonalSchema.parse(demographics)
      assertEquals(parsed, demographics)
    })

    itParallel(
      'is accessed immediately after the start-registration process',
      async () => {
        const { fetchCheerio, fetchOk } = await addTestEmployeeWithSession(db, {
          profession: 'receptionist',
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

        const response = await fetchOk($.url, {
          method: 'POST',
          body: asFormData({
            phone_number: randomPhoneNumber('ZA'),
            ...randomDemographics('ZA'),
          }),
        }, {
          cancel_response_body: true,
        })

        assertEquals(
          response.url,
          `${route}/app/organizations/${TEST_ORGANIZATION_UUIDS.ZA.clinic}/patients/${patient_id}/open_encounter/registration/this_visit`,
        )
      },
    )
  },
)
