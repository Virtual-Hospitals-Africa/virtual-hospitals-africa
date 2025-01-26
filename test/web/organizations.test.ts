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
        address: '123 Main St, Gweru, Zimbabwe, 23456',
        category: 'Clinic',
        description: '123 Main St, Gweru, Zimbabwe, 23456',
        name: 'VHA Test Clinic',
        distance_meters: 12100,
        google_maps_link: 'https://maps.google.com',
        location: {
          latitude: -19.4554096,
          longitude: 29.7739353,
        },
      })
      assertEquals(test_virtual_hospital, {
        id: '00000000-0000-0000-0000-000000000002',
        address: '12356 Main St, Gweru, Zimbabwe, 23456',
        category: 'Regional Medical Center',
        description: '12356 Main St, Gweru, Zimbabwe, 23456',
        name: 'VHA Test Regional Medical Center',
        distance_meters: 12100,
        google_maps_link: 'https://maps.google.com',
        location: {
          latitude: -19.4555096,
          longitude: 29.7738353,
        },
      })
    })
  },
)
