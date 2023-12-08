import { it } from '$std/testing/bdd.ts'
import { assert } from '$std/assert/assert.ts'
import {
  addTestHealthWorkerWithSession,
  describeWithWebServer,
} from './utilities.ts'
import { assertEquals } from '$std/assert/assert_equals.ts'

describeWithWebServer('/app/facilities', 8005, (route) => {
  it('can search for facilities by name', async () => {
    const { sessionId } = await addTestHealthWorkerWithSession({
      scenario: 'approved-nurse',
    })
    const response = await fetch(`${route}/app/facilities?search=VHA Test`, {
      headers: {
        Cookie: `sessionId=${sessionId}`,
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
      display_name: 'VHA Test Hospital',
      latitude: '51',
      longitude: '2.25',
      phone: null,
    })
  })
})
