import { it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import {
  addTestHealthWorkerWithSession,
  describeWithWebServer,
} from './utilities.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'

describeWithWebServer('/app/facilities', 8005, (route) => {
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
    assertEquals(json.length, 1)
    const [facility] = json
    assertEquals(facility, {
      id: 1,
      address: 'Bristol, UK',
      category: 'Hospital',
      name: 'VHA Test Hospital',
      latitude: '51',
      longitude: '2.25',
      phone: null,
    })
  })
})
