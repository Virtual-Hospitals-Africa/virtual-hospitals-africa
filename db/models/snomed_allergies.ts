import { sql } from 'kysely'
import { SnomedCategory } from '../../db.d.ts'
import type { SnomedConcept, TrxOrDbOrQueryCreator } from '../../types.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import { base, identity } from './_base.ts'
import { jsonArrayFromColumn } from '../helpers.ts'

type SearchTerms = {
  search: string
  categories?: SnomedCategory[]
  descendant_of_concept?: SnomedConcept
}

function baseQuery(trx: TrxOrDbOrQueryCreator, terms: SearchTerms) {
  assertOr400(terms.search, 'Must be searching for a term')

  const best_similarity = sql<number>`max(similarity(term, ${terms.search}))`

  return trx
    .selectFrom('snomed_inferred_canonical_name_and_category')
    .innerJoin(
      'snomed_description',
      'snomed_inferred_canonical_name_and_category.id',
      'snomed_description.concept_id',
    )
    .leftJoin(
      'snomed_inferred_canonical_name_and_category as preferred_category_of_same_name',
      (join) =>
        terms.categories
          ? join.on((eb) =>
            eb.or(
              terms.categories!.slice(1).flatMap((category, i) => {
                const higher_ranking_categories = terms.categories!.slice(0, i + 1)
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
    .$if(!!terms.descendant_of_concept, (qb) =>
      qb.where((eb) =>
        sql<boolean>`
          is_descendant(${eb.ref('snomed_description.concept_id')}, ${terms.descendant_of_concept!.id}::bigint)
        `
      ))
    .$if(!!terms.categories, (qb) => qb.where('snomed_inferred_canonical_name_and_category.category', 'in', terms.categories!))
    .select((eb) => [
      'snomed_inferred_canonical_name_and_category.id',
      'snomed_inferred_canonical_name_and_category.name',
      'snomed_inferred_canonical_name_and_category.category',
      jsonArrayFromColumn(
        'term',
        eb.selectFrom('snomed_description as aliases')
          .where('aliases.concept_id', '=', eb.ref('snomed_inferred_canonical_name_and_category.id'))
          .where('aliases.term', '!=', eb.ref('snomed_inferred_canonical_name_and_category.name'))
          .where('aliases.id', '!=', eb.ref('snomed_inferred_canonical_name_and_category.description_id'))
          .where('aliases.active', '=', true)
          .select('aliases.term'),
      )
        .as('description'),
      best_similarity.as('best_similarity'),
    ])
    .groupBy('snomed_inferred_canonical_name_and_category.id')
    .orderBy(best_similarity, 'desc')
}

export const snomed_allergies = base({
  verbose: true,
  top_level_table: 'snomed_inferred_canonical_name_and_category',
  baseQuery,
  formatResult: identity,
})
