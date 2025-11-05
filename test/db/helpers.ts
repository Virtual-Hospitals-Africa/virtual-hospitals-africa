import { afterAll, describe, it } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { temporaryTable } from '../../db/helpers.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { COMMON_CONDITIONS } from '../../db/models/brief_history.ts'

describe('temporaryTable', () => {
  afterAll(() => db.destroy())
  it('can insert values into a temporary table which may then be selected from', async () => {
    const results = await db.with('foo', () =>
      temporaryTable(db, [
        { x: 5, y: 7, z: 'bar' },
        { x: 8, y: 9, z: 'baz' },
      ])).selectFrom('foo').where('x', '>', 7).select(['y', 'z']).execute()

    assertEquals(results, [
      { y: 9, z: 'baz' },
    ])
  })

  it('foo', async () => {
    await db.with(
      'common_conditions',
      () => temporaryTable(db, COMMON_CONDITIONS),
    )
      .with('foo', qb => {
        qb.selectFrom('common_conditions')
          .select('descendant_id')
          .distinct()
         select distinct
            "descendant_id"
          from
            "common_conditions"
            cross join lateral active_descendant_snomed_concepts("common_conditions"."snomed_concept_id"::bigint)
      })
  })
})
