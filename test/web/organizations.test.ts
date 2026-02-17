import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { addTestEmployeeWithSession } from '../_helpers/employees.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { route } from '../_route.ts'
import waitUntilTestServerUp from '../_helpers/waitUntilTestServerUp.ts'
import { assertMatches } from '../../util/assertMatches.ts'

describeParallel(
  '/app/organizations',
  () => {
    before(waitUntilTestServerUp)
    afterAll(() => db.destroy())
    itParallel('can search for organizations by name', async () => {
      const { fetch } = await addTestEmployeeWithSession(db, {
        role: 'nurse',
        specialty: 'Primary care',
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
      assertMatches(test_clinic, {
        id: '00000000-0000-1000-8000-000000000001',
        name: 'VHA Test Clinic South Africa',
        category: 'Clinic',
        is_test: true,
        country: 'ZA',
        ownership: 'Govt.',
        inactive_reason: null,
        formatted_address: '123 Main St, Polokwane, South Africa, 23456',
        location: {
          latitude: -19.4554096,
          longitude: 29.7739353,
        },
        most_common_language_code: 'nso',
      })
      assertMatches(test_virtual_hospital, {
        id: '00000000-0000-1000-8000-000000000002',
        name: 'VHA Test Regional Medical Center South Africa',
        category: 'Regional Medical Center',
        is_test: true,
        country: 'ZA',
        ownership: 'Govt.',
        inactive_reason: null,
        formatted_address: '12356 Main St, Polokwane, South Africa, 23456',
        location: {
          latitude: -19.4555096,
          longitude: 29.7738353,
        },
        most_common_language_code: 'nso',
      })
    })
  },
)
