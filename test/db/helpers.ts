import { describe, it } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { temporaryTable } from '../../db/helpers.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

describe('temporaryTable', () => {
  it('can insert values into a temporary table which may then be selected from', async () => {
    const results = await temporaryTable(db, 'foo', [
      { x: 5, y: 7 },
      { x: 8, y: 9 },
    ]).selectFrom('foo').where('x', '>', 7).select('y').execute()

    assertEquals(results, [
      { y: 9 },
    ])
  })
})
