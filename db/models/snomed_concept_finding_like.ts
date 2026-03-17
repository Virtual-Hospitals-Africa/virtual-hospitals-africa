import { sql } from 'kysely'
import { TrxOrDbOrQueryCreator } from '../../types.ts'
import { base, identity } from './_base.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import { SnomedCategory } from '../../db.d.ts'

type SearchTerms = {
  search: string
}

const categories: SnomedCategory[] = [
  'finding' as const,
  'morphologic abnormality' as const,
  'disorder' as const,
]

function baseQuery(trx: TrxOrDbOrQueryCreator, terms: SearchTerms) {
  assertOr400(terms.search, 'Must be searching for a term')

  const best_similarity = sql<number>`max(similarity(term, ${terms.search}))`

  return trx
    .selectFrom('snomed_concept_finding_like')
    .innerJoin(
      'snomed_inferred_canonical_name_and_category',
      'snomed_inferred_canonical_name_and_category.id',
      'snomed_concept_finding_like.id',
    )
    .leftJoin(
      'snomed_inferred_canonical_name_and_category as preferred_category_of_same_name',
      (join) =>
        categories
          ? join.on((eb) =>
            eb.or(
              categories!.slice(1).flatMap((category, i) => {
                const higher_ranking_categories = categories!.slice(0, i + 1)
                return higher_ranking_categories.map((higher_ranking_category) =>
                  eb.and([
                    eb('preferred_category_of_same_name.name', '=', eb.ref('snomed_inferred_canonical_name_and_category.name')),
                    eb('snomed_inferred_canonical_name_and_category.category', '=', category),
                    eb('preferred_category_of_same_name.category', '=', higher_ranking_category),
                  ])
                )
              }),
            )
          )
          : join.on(sql<boolean>`false`),
    )
    .where('preferred_category_of_same_name.id', 'is', null)
    .where(sql<boolean>`term % ${terms.search}`)
    .select([
      'snomed_inferred_canonical_name_and_category.id',
      'snomed_inferred_canonical_name_and_category.name',
      'snomed_inferred_canonical_name_and_category.category',
      best_similarity.as('best_similarity'),
    ])
    .groupBy('snomed_inferred_canonical_name_and_category.id')
    .orderBy(best_similarity, 'desc')
}

export const snomed_concept_finding_like = base({
  top_level_table: 'snomed_concept_finding_like',
  baseQuery,
  formatResult: identity,
})
