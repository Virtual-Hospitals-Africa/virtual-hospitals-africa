import type { TrxOrDbOrQueryCreator } from '../../types.ts'
import { base, identity } from './_base.ts'
import { IS_A } from '../../shared/snomed_concepts.ts'
import { snomedConceptSelection } from './s_expression.ts'
import { Lang } from '../../shared/s_expression_schemas.ts'
import { ExpressionWrapper, sql } from 'kysely'
import { DB } from '../../db.d.ts'

type SearchTerms = {
  // deno-lint-ignore no-explicit-any
  snomed_concept: Lang['snomed_concept'] | ExpressionWrapper<DB, any, string>
}

/*
  The s_expression form of the relationship, as produced by the 'attribute' case of
  inverseSExpression. The root concept is omitted because every relationship selected
  here hangs off ATTRIBUTE, which is what the two-concept form parses back into.
*/
const attribute_s_expression = sql<string>`format(
  '(attribute (snomed_concept "%s" "%s") (snomed_concept "%s" "%s"))',
  rel_type.name,
  rel_type.category,
  rel_dest.name,
  rel_dest.category
)`

function baseQuery(trx: TrxOrDbOrQueryCreator, { snomed_concept }: SearchTerms) {
  return trx
    .selectFrom('snomed_relationship')
    .innerJoin(
      'snomed_inferred_canonical_name_and_category as rel_type',
      'rel_type.id',
      'snomed_relationship.type_id',
    )
    .innerJoin(
      'snomed_inferred_canonical_name_and_category as rel_dest',
      'rel_dest.id',
      'snomed_relationship.destination_id',
    )
    .where('snomed_relationship.source_id', ...snomedConceptSelection(trx, snomed_concept))
    .where('snomed_relationship.active', '=', true)
    .where('snomed_relationship.type_id', '!=', IS_A.id)
    .select(attribute_s_expression.as('s_expression'))
    .distinct()
    // Ordering by the s_expression orders by the attribute's name, then its value
    .orderBy(attribute_s_expression)
}

export const snomed_predefined_attributes = base({
  top_level_table: 'snomed_relationship',
  baseQuery,
  formatResult: identity,
  async sExpressions(trx: TrxOrDbOrQueryCreator, terms: SearchTerms): Promise<string[]> {
    const rows = await snomed_predefined_attributes.findAll(trx, terms)
    return rows.map(({ s_expression }) => s_expression)
  },
})
