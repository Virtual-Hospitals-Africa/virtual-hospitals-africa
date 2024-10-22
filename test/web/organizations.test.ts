import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { addTestHealthWorkerWithSession, route } from './utilities.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'

describe(
  '/app/organizations',
  { sanitizeResources: false, sanitizeOps: false },
  () => {
    it('can search for organizations by name', async () => {
      const { fetch } = await addTestHealthWorkerWithSession(db, {
        scenario: 'approved-nurse',
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
      assertEquals(test_clinic, {
        id: '00000000-0000-0000-0000-000000000001',
        address: '123 Main St, Bristol, UK, 23456',
        category: 'Clinic',
        description: '123 Main St, Bristol, UK, 23456',
        name: 'VHA Test Clinic',
        location: {
          latitude: 51.4545,
          longitude: -2.5879,
        },
      })
      assertEquals(test_virtual_hospital, {
        id: '00000000-0000-0000-0000-000000000002',
        address: null,
        category: 'Virtual Hospital',
        description: null,
        name: 'VHA Test Virtual Hospital',
        location: null,
      })
    })
  },
)
