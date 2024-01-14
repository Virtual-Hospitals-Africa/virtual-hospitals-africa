import { assert } from 'std/assert/assert.ts'
import {
  addTestHealthWorkerWithSession,
  describeWithWebServer,
  itUsesTrxAnd,
} from './utilities.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

describeWithWebServer('/app/health_workers', 8006, (route) => {
  itUsesTrxAnd('can return a health worker', async (trx) => {
    const { fetch, healthWorker } = await addTestHealthWorkerWithSession(trx, {
      scenario: 'approved-nurse',
    })
    const response = await fetch(
      `${route}/app/health_workers?profession=nurse`,
      {
        headers: {
          Accept: 'application/json',
        },
      },
    )
    if (!response.ok) throw new Error(await response.text())
    const json = await response.json()
    assert(Array.isArray(json))
    assertEquals(json.length, 1)
    assertEquals(json[0].id, healthWorker.id)
  })
})
