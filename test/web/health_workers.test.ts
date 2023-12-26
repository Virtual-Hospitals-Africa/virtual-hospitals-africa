import { it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import {
  addTestHealthWorkerWithSession,
  describeWithWebServer,
} from './utilities.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

describeWithWebServer('/app/health_workers', 8006, (route) => {
  it('can return a health worker representing the next available health worker', async () => {
    const { sessionId, healthWorker } = await addTestHealthWorkerWithSession({
      scenario: 'approved-nurse',
    })
    const response = await fetch(
      `${route}/app/health_workers?include_next_available=true&profession=nurse`,
      {
        headers: {
          Cookie: `sessionId=${sessionId}`,
          Accept: 'application/json',
        },
      },
    )
    if (!response.ok) throw new Error(await response.text())
    const json = await response.json()
    assert(Array.isArray(json))
    assertEquals(json.length, 2)
    assertEquals(json[0], {
      id: 'next_available',
      name: 'Next Available',
      avatar_url: null, // TODO: add avatar_url for next available
    })
    assertEquals(json[1].id, healthWorker.id)
  })
})
