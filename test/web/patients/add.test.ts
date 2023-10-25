import {
  it,
} from 'std/testing/bdd.ts'
import { redis } from '../../../external-clients/redis.ts'
import db from '../../../db/db.ts'
import { assert } from 'std/assert/assert.ts'
import {
  addTestHealthWorkerWithSession,
  describeWithWebServer,
} from '../utilities.ts'

describeWithWebServer('/app/patients/add', 8004, (route) => {
  it('loads the page', async () => {
    const { sessionId, healthWorker } = await addTestHealthWorkerWithSession()
    const response = await fetch(`${route}/app/patients/add?step=personal`, {
      headers: {
        Cookie: `sessionId=${sessionId}`,
      },
    })
    assert(response.ok, 'should have returned ok')
    assert(response.url === `${route}/app/patients/add?step=personal`)
    const pageContents = await response.text()
    assert(pageContents.includes('Next Step'), 'should include Next Step')
  })
})
