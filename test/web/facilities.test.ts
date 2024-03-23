import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { addTestHealthWorkerWithSession, route } from './utilities.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'

describe(
  '/app/facilities',
  { sanitizeResources: false, sanitizeOps: false },
  () => {
    it('can search for facilities by name', async () => {
      const { fetch } = await addTestHealthWorkerWithSession(db, {
        scenario: 'approved-nurse',
      })
      const response = await fetch(`${route}/app/facilities?search=VHA Test`, {
        headers: {
          Accept: 'application/json',
        },
      })
      if (!response.ok) throw new Error(await response.text())
      const json = await response.json()
      assert(Array.isArray(json))
      assertEquals(json.length, 2)
      const [test_clinic, test_virtual_hospital] = json
      assertEquals(test_clinic, {
        id: 1,
        address: 'Bristol, UK',
        category: 'Clinic',
        description: 'Bristol, UK',
        name: 'VHA Test Clinic',
        latitude: '51',
        longitude: '2.25',
        phone: null,
      })
      assertEquals(test_virtual_hospital, {
        id: 2,
        address: null,
        category: 'Virtual Hospital',
        description: null,
        name: 'VHA Test Virtual Hospital',
        latitude: null,
        longitude: null,
        phone: null,
      })
    })
  },
)
