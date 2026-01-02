import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll, before } from 'std/testing/bdd.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import db from '../../db/db.ts'
import { addTestEmployeeWithSession } from '../_helpers/employees.ts'
import { route } from '../route.ts'
import waitUntilTestServerUp from '../_helpers/waitUntilTestServerUp.ts'
import matching from '../../util/matching.ts'

describeParallel(
  '/app/providers',
  () => {
    before(waitUntilTestServerUp)
    afterAll(() => db.destroy())
    itParallel('can return a provider', async () => {
      const { fetch, health_worker } = await addTestEmployeeWithSession(
        db,
        {
          profession: 'nurse',
          specialty: 'Primary care',
          registration_status: 'approved',
        },
      )
      const response = await fetch(
        `${route}/app/providers?professions=[nurse]&search=${health_worker.name}`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      )
      if (!response.ok) throw new Error(await response.text())
      const { results } = await response.json()
      assert(Array.isArray(results))

      const found = results.find(matching({ id: health_worker.id }))
      assert(found)
      assertEquals(found.name, health_worker.name)
    })
  },
)
