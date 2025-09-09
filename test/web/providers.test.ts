import { afterAll, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { addTestHealthWorkerWithSession, route } from './utilities.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'

describe(
  '/app/providers',
  () => {
    afterAll(() => db.destroy())
    it('can return a provider', async () => {
      const { fetch, health_worker } = await addTestHealthWorkerWithSession(
        db,
        {
          scenario: 'approved-nurse',
        },
      )
      const response = await fetch(
        `${route}/app/providers?profession=nurse&search=${health_worker.name}`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      )
      if (!response.ok) throw new Error(await response.text())
      const json = await response.json()
      assert(Array.isArray(json))

      const found = json.find((hw) => hw.health_worker_id === health_worker.id)
      assert(found)
      assertEquals(found.name, health_worker.name)
    })
  },
)
