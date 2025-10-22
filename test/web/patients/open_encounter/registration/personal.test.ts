import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import db from '../../../../../db/db.ts'
import { addTestEmployeeWithSession } from '../../../../_helpers/employees.ts'
import { route } from '../../../../route.ts'
import { TEST_ORGANIZATION_UUIDS } from '../../../../_helpers/organizations.ts'
import { isUUID } from '../../../../../util/uuid.ts'

describe(
  '/app/organizations/[organization_id]/patients/[patient_id]/open_encounters/registration/personal',
  () => {
    afterAll(() => db.destroy())

    it('is accessed immediately after the start-registration process', async () => {
      const { fetchCheerio } = await addTestEmployeeWithSession(db, {
        profession: 'receptionist',
        registration_status: 'approved',
      })

      const $ = await fetchCheerio(
        `${route}/app/organizations/${TEST_ORGANIZATION_UUIDS.za.clinic}/patients/start-registration`,
        {
          method: 'POST',
        },
      )

      assert($('input[name="first_name"]').length === 1)
      assert($('input[name="middle_names"]').length === 1)
      assert($('input[name="last_name"]').length === 1)
      assert($('input[name="nonexistant"]').length === 0)

      const patient_id = $.url.match(/patients\/(.*)\/personal/)![1]
      assert(isUUID(patient_id))
    })
  },
)
