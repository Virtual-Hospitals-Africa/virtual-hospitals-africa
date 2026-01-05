import { afterAll } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import {
  findingQueryExpression,
  WARNING_SIGNS,
} from '../../shared/warning_signs.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { buildExpressionPredicate } from '../../db/models/s_expression_snomed_concepts.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import assertLength from '../../util/assertLength.ts'

describeParallel('db/models/s_expression_concepts.ts', () => {
  afterAll(() => db.destroy())

  itParallel(
    'can be joined against to determine if a given concept matches an s_expression for a simple case',
    async () => {
      const persistent_vomiting_s_expression = findingQueryExpression(
        WARNING_SIGNS['Persistent vomiting'],
      )

      const results = await db.selectFrom(
        'snomed_inferred_canonical_name_and_category',
      )
        .where('snomed_inferred_canonical_name_and_category.id', 'in', [
          '196746003',
          '21522001',
        ])
        .selectAll('snomed_inferred_canonical_name_and_category')
        .select((eb) => [
          buildExpressionPredicate(
            eb,
            'snomed_inferred_canonical_name_and_category.id',
            persistent_vomiting_s_expression,
          ).as('is_persistent_vomiting'),
        ])
        .orderBy('name', 'asc')
        .execute()

      assertLength(results, 2)
      assertEquals(results[0].name, 'Abdominal pain')
      assertEquals(results[1].name, 'Persistent vomiting')
      assertEquals(results[0].is_persistent_vomiting, false)
      assertEquals(results[1].is_persistent_vomiting, true)
    },
  )

  itParallel(
    'can be joined against to determine if a given concept matches an s_expression for a complex case',
    async () => {
      const burn_other_s_expression = findingQueryExpression(
        WARNING_SIGNS['Burn Other'],
      )

      // Test multiple concepts at once: Burn (125666000), Burn of back (72998004),
      // Abdominal pain (21522001), Inhalation burn (425082000)
      const results = await db.selectFrom(
        'snomed_inferred_canonical_name_and_category',
      )
        .where('snomed_inferred_canonical_name_and_category.id', 'in', [
          '125666000', // Burn - should match (is a burn, not excluded)
          '72998004', // Burn of back - should match (descendant of burn, not excluded)
          '21522001', // Abdominal pain - should NOT match (not a burn)
          '425082000', // Inhalation burn - should NOT match (excluded by the expression)
        ])
        .selectAll('snomed_inferred_canonical_name_and_category')
        .select((eb) => [
          buildExpressionPredicate(
            eb,
            'snomed_inferred_canonical_name_and_category.id',
            burn_other_s_expression,
          ).as('is_burn_other'),
        ])
        .orderBy('name', 'asc')
        .execute()

      assertLength(results, 4)

      // Abdominal pain - not a burn
      assertEquals(results[0].name, 'Abdominal pain')
      assertEquals(results[0].is_burn_other, false)

      // Burn - top level, matches
      assertEquals(results[1].name, 'Burn')
      assertEquals(results[1].is_burn_other, true)

      // Burn of back - descendant of burn, not excluded
      assertEquals(results[2].name, 'Burn of back')
      assertEquals(results[2].is_burn_other, true)

      // Inhalation burn - excluded by the expression
      assertEquals(results[3].name, 'Inhalation burn due to hot gas')
      assertEquals(results[3].is_burn_other, false)
    },
  )
})
