import { sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'
import { base } from './_base.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import { SnomedCategory } from '../../db.d.ts'
// import { KEYED_WARNING_SIGNS } from '../../shared/warning_signs.ts'
// import { parseExpressionExpectingAtom } from '../../shared/s_expression.ts'

type SearchTerms = {
  search: string
  categories?: SnomedCategory[]
}

// KEYED_WARNING_SIGNS.map(
//   ({ excluding_s_expression, clinical_finding_s_expression }) => {
//     const s_expression = excluding_s_expression
//       ? `(and ${clinical_finding_s_expression}
//           (not ${excluding_s_expression}))
//     `
//       : clinical_finding_s_expression

//     const expr = parseExpressionExpectingAtom(s_expression)
//   },
// )

function baseQuery(trx: TrxOrDb, terms: SearchTerms) {
  assertOr400(terms.search, 'Must be searching for a term')

  const descriptions_with_similarity = trx
    .selectFrom('snomed_description')
    .innerJoin(
      'snomed_concept',
      'snomed_concept.id',
      'snomed_description.concept_id',
    )
    .where('snomed_concept.active', '=', true)
    // Maybe if they're searching by an outdated term we still want to return it?
    // .where('snomed_description.active', '=', true)
    // Use trigram similarity operator for fuzzy matching
    .where(sql<boolean>`term % ${terms.search}`)
    .select([
      'snomed_description.concept_id',
      sql<number>`similarity(term, ${terms.search})`.as('similarity'),
    ])
    .as('descriptions_with_similarity')

  const snomed_concepts = trx.selectFrom(
    descriptions_with_similarity,
  )
    .select([
      'descriptions_with_similarity.concept_id',
      sql<number>`max(descriptions_with_similarity.similarity)`.as(
        'best_similarity',
      ),
    ])
    .groupBy('descriptions_with_similarity.concept_id')
    .as('snomed_concepts')

  return trx.selectFrom('snomed_inferred_canonical_name_and_category')
    .innerJoin(
      snomed_concepts,
      'snomed_concepts.concept_id',
      'snomed_inferred_canonical_name_and_category.id',
    )
    .selectAll('snomed_inferred_canonical_name_and_category')
    .select('snomed_concepts.best_similarity')
    .$if(
      !!terms.categories,
      (qb) =>
        qb.where(
          'snomed_inferred_canonical_name_and_category.category',
          'in',
          terms.categories!,
        ),
    )
    .orderBy('snomed_concepts.best_similarity', 'desc')
}

export const snomed_model = base({
  verbose: true,
  top_level_table: 'snomed_inferred_canonical_name_and_category',
  baseQuery,
  formatResult(result) {
    return result
  },
})
