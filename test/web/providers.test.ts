import { afterAll, before, describe, it } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { addTestEmployeeWithSession } from '../_helpers/employees.ts'
import { route } from '../route.ts'
import waitUntilTestServerUp from '../_helpers/waitUntilTestServerUp.ts'

describe(
  '/app/employees',
  () => {
    before(waitUntilTestServerUp)
    afterAll(() => db.destroy())
    it('can return a provider', async () => {
      const { fetch, health_worker } = await addTestEmployeeWithSession(
        db,
        {
          profession: 'nurse',
          specialty: 'primary care',
          registration_status: 'approved',
        },
      )
      const response = await fetch(
        `${route}/app/employees?professions=[nurse]&search=${health_worker.name}`,
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
