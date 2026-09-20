import { afterAll } from 'std/testing/bdd.ts'
import db from '../../db/db.ts'
import { findingQueryExpression, KEYED_WARNING_SIGNS } from '../../shared/warning_signs.ts'
import { describeParallel, itParallel } from 'test/_helpers/testParallel.ts'
import { buildExpressionPredicate, searchSnomedConceptsMatching } from '../../db/models/s_expression_snomed_concepts.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import assertLength from '../../util/assertLength.ts'
import { assert } from 'std/assert/assert.ts'

describeParallel('db/models/s_expression_concepts.ts', () => {
  afterAll(() => db.destroy())

  itParallel(
    'can be joined against to determine if a given concept matches an s_expression for a simple case',
    async () => {
      const persistent_vomiting_s_expression = findingQueryExpression(
        KEYED_WARNING_SIGNS['Persistent vomiting'],
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
        KEYED_WARNING_SIGNS['Burn Other'],
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
  itParallel(
    'searches for the concepts that SNOMED itself defines with every attribute of a finding',
    async () => {
      const results = await searchSnomedConceptsMatching(
        db,
        `(finding
          (attribute (snomed_concept "Interprets" "attribute") (snomed_concept "Ability to speak" "observable entity"))
          (attribute (snomed_concept "Has interpretation" "attribute") (snomed_concept "Able with difficulty" "qualifier value"))
        )`,
      )

      const names = results.map((r) => r.name)
      assert(names.includes('Difficulty talking'), `Expected Difficulty talking in ${names}`)
      assert(!names.includes('Unable to speak'), `Did not expect Unable to speak in ${names}`)
      assertEquals(results.find((r) => r.name === 'Difficulty talking')!.id, '286378009')
    },
  )

  itParallel(
    'a single attribute matches every concept SNOMED defines with that attribute',
    async () => {
      const results = await searchSnomedConceptsMatching(
        db,
        `(finding (attribute (snomed_concept "Interprets" "attribute") (snomed_concept "Ability to speak" "observable entity")))`,
      )

      const names = results.map((r) => r.name)
      assert(names.includes('Difficulty talking'), `Expected Difficulty talking in ${names}`)
      assert(names.includes('Unable to speak'), `Expected Unable to speak in ${names}`)
      assert(!names.includes('Abdominal pain'), `Did not expect Abdominal pain in ${names}`)
    },
  )

  itParallel(
    'the interprets shorthand names the Interprets attribute with an observable entity',
    async () => {
      const results = await searchSnomedConceptsMatching(db, `(finding (interprets "Ability to speak"))`)

      const names = results.map((r) => r.name)
      assert(names.includes('Difficulty talking'), `Expected Difficulty talking in ${names}`)
      assert(names.includes('Unable to speak'), `Expected Unable to speak in ${names}`)
      assert(!names.includes('Abdominal pain'), `Did not expect Abdominal pain in ${names}`)
    },
  )

  itParallel(
    'a specific concept restricts the search to its descendants and excluding drops the excluded concepts',
    async () => {
      const results = await searchSnomedConceptsMatching(
        db,
        `(clinical_finding (snomed_concept "Finding related to ability to speak" "finding")
          (excluding (clinical_finding (snomed_concept "Unable to speak" "finding"))))`,
      )

      const names = results.map((r) => r.name)
      assert(names.includes('Finding related to ability to speak'), `Expected the concept itself in ${names}`)
      assert(names.includes('Difficulty talking'), `Expected Difficulty talking in ${names}`)
      assert(!names.includes('Unable to speak'), `Did not expect Unable to speak in ${names}`)
      assert(!names.includes('Abdominal pain'), `Did not expect Abdominal pain in ${names}`)
    },
  )
})
