import { describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { addTestHealthWorkerWithSession, route } from './utilities.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'

describe(
  '/app/providers',
  { sanitizeResources: false, sanitizeOps: false },
  () => {
    it('can return a provider', async () => {
      const { fetch, healthWorker } = await addTestHealthWorkerWithSession(db, {
        scenario: 'approved-nurse',
      })
      const response = await fetch(
        `${route}/app/providers?profession=nurse&search=${healthWorker.name}`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      )
      if (!response.ok) throw new Error(await response.text())
      const json = await response.json()
      assert(Array.isArray(json))

      const found = json.find((hw) => hw.health_worker_id === healthWorker.id)
      assert(found)
      assertEquals(found.name, healthWorker.name)
    })
  },
)
