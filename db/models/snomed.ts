import { sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'
import { base } from './_base.ts'
import { assert } from 'node:console'
import { assertOr400 } from '../../util/assertOr.ts'
type SearchTerms = {
  search: string
}


// .selectAll('with_includes')
//     .select([
//       sql<number>`
//         GREATEST(
//           with_includes.similarity,
//           (SELECT max((include->>'similarity')::real)
//              FROM json_array_elements(includes) AS include)
//         )
//       `.as('best_similarity'),
//     ])
//     .orderBy('best_similarity', 'desc')

  // .innerJoin(
  //   'snomed_inferred_canonical_name_and_category',
  //   'snomed_inferred_canonical_name_and_category.id',
  //   'descriptions_with_similarity.concept_id'
  // ).selectAll('snomed_inferred_canonical_name_and_category')
  // .select([
  //   sql<number>`max(descriptions_with_similarity.similarity)`.as('best_similarity')
  // ])
  


function baseQuery(trx: TrxOrDb, terms: SearchTerms) {
  assertOr400(terms.search, "Must be searching for a term")

  const descriptions_with_similarity = trx
    .selectFrom('snomed_description')
    .innerJoin('snomed_concept', 'snomed_concept.id', 'snomed_description.concept_id')
    .where('snomed_concept.active', '=', true)
    // Maybe if they're searching by an outdated term we still want to return it?
    // .where('snomed_description.active', '=', true)
    .select([
      'snomed_description.concept_id',
      sql<number>`
        ts_rank(term_vector, plainto_tsquery(${terms.search}))
      `.as('similarity'),
    ]).as('descriptions_with_similarity')
  
  const snomed_concepts = trx.selectFrom(
    descriptions_with_similarity
  )
  .select([
    'descriptions_with_similarity.concept_id',
    sql<number>`max(descriptions_with_similarity.similarity)`.as('best_similarity')
  ])
  .groupBy('descriptions_with_similarity.concept_id')
  .as('snomed_concepts')
  
  return trx.selectFrom('snomed_inferred_canonical_name_and_category')
    .innerJoin(snomed_concepts, 'snomed_concepts.concept_id', 'snomed_inferred_canonical_name_and_category.id')
    .selectAll('snomed_inferred_canonical_name_and_category')
    .select('snomed_concepts.best_similarity')
    .orderBy('snomed_concepts.best_similarity', 'desc')
}
// if (opts.search) {
//   qb = qb.where('snomed_inferred_canonical_name_and_category.name', 'ilike', `%${opts.search}%`)

// }

export const snomed_model = base({
  verbose: true,
  top_level_table: 'snomed_inferred_canonical_name_and_category',
  baseQuery,
  formatResult(result) {
    return result
  },
})
