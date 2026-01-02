import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { afterAll } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { temporaryTable } from '../../db/helpers.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

describeParallel('temporaryTable', () => {
  afterAll(() => db.destroy())
  itParallel(
    'can insert values into a temporary table which may then be selected from',
    async () => {
      const results = await db.with('foo', () =>
        temporaryTable(db, [
          { x: 5, y: 7, z: 'bar' },
          { x: 8, y: 9, z: 'baz' },
        ])).selectFrom('foo').where('x', '>', 7).select(['y', 'z']).execute()

      assertEquals(results, [
        { y: 9, z: 'baz' },
      ])
    },
  )
})
