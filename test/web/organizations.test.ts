import { afterAll, before, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { addTestEmployeeWithSession } from '../_helpers/employees.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import omit from '../../util/omit.ts'
import { route } from '../route.ts'
import waitUntilTestServerUp from '../_helpers/waitUntilTestServerUp.ts'

describe(
  '/app/organizations',
  () => {
    before(waitUntilTestServerUp)
    afterAll(() => db.destroy())
    it('can search for organizations by name', async () => {
      const { fetch } = await addTestEmployeeWithSession(db, {
        profession: 'nurse',
        specialty: 'primary care',
        registration_status: 'approved',
      })
      const response = await fetch(
        `${route}/app/organizations?search=VHA Test`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      )
      if (!response.ok) throw new Error(await response.text())
      const json = await response.json()
      assert(Array.isArray(json.results))
      assertEquals(json.results.length, 2)
      const [test_clinic, test_virtual_hospital] = json.results
      assertEquals(omit(test_clinic, ['departments']), {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'VHA Test Clinic South Africa',
        category: 'Clinic',
        is_test: true,
        country: 'ZA',
        ownership: 'Govt.',
        inactive_reason: null,
        formatted_address: '123 Main St, Polokwane, South Africa, 23456',
        description: '123 Main St, Polokwane, South Africa, 23456',
        location: {
          latitude: -19.4554096,
          longitude: 29.7739353,
        },
        most_common_language_code: 'nso',
      })
      assertEquals(omit(test_virtual_hospital, ['departments']), {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'VHA Test Regional Medical Center South Africa',
        category: 'Regional Medical Center',
        is_test: true,
        country: 'ZA',
        ownership: 'Govt.',
        inactive_reason: null,
        formatted_address: '12356 Main St, Polokwane, South Africa, 23456',
        description: '12356 Main St, Polokwane, South Africa, 23456',
        location: {
          latitude: -19.4555096,
          longitude: 29.7738353,
        },
        most_common_language_code: 'nso',
      })
    })
  },
)
