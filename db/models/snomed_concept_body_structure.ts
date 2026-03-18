import { sql } from 'kysely'
import { TrxOrDbOrQueryCreator } from '../../types.ts'
import { base, identity } from './_base.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import { jsonArrayFrom } from '../helpers.ts'

type SearchTerms = {
  search: string
}

function baseQuery(trx: TrxOrDbOrQueryCreator, terms: SearchTerms) {
  assertOr400(terms.search, 'Must be searching for a term')

  const best_similarity = sql<number>`max(similarity(term, ${terms.search}))`

  return trx
    .selectFrom('snomed_concept_body_structure')
    .innerJoin(
      'snomed_inferred_canonical_name_and_category',
      'snomed_inferred_canonical_name_and_category.id',
      'snomed_concept_body_structure.id',
    )
    .where(sql<boolean>`term % ${terms.search}`)
    .select((eb) => [
      'snomed_inferred_canonical_name_and_category.id',
      'snomed_inferred_canonical_name_and_category.name',
      'snomed_inferred_canonical_name_and_category.category',
      best_similarity.as('best_similarity'),
      jsonArrayFrom(
        eb.selectFrom('snomed_relationship')
          .innerJoin('snomed_concept', 'snomed_concept.id', 'snomed_relationship.source_id')
          .innerJoin(
            'snomed_inferred_canonical_name_and_category as desc_info',
            'desc_info.id',
            'snomed_relationship.source_id',
          )
          .whereRef('snomed_relationship.destination_id', '=', 'snomed_concept_body_structure.id')
          .where('snomed_relationship.active', '=', true)
          .where('snomed_concept.active', '=', true)
          .where('snomed_relationship.type_id', '=', '116680003')
          .select(['desc_info.id', 'desc_info.name', 'desc_info.category']),
      ).as('immediate_descendants'),
      eb.selectFrom(
        sql<{ descendant_id: bigint; ancestor_ids: bigint[] }>`active_descendant_snomed_concepts(${eb.ref('snomed_concept_body_structure.id')})`.as('d'),
      )
        .where(sql<boolean>`cardinality(d.ancestor_ids) >= 1`)
        .select((eb2) => eb2.fn.countAll<number>().as('count'))
        .as('total_descendants'),
    ])
    .groupBy('snomed_inferred_canonical_name_and_category.id')
    .orderBy(best_similarity, 'desc')
}

export const snomed_concept_body_structure = base({
  top_level_table: 'snomed_concept_body_structure',
  baseQuery,
  formatResult: identity,
})
