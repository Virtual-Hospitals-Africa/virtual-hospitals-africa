import type { TrxOrDbOrQueryCreator } from '../../types.ts'
import { base, identity } from './_base.ts'
import { jsonBuildObject, literalString } from '../helpers.ts'
import { ATTRIBUTE, IS_A } from '../../shared/snomed_concepts.ts'
import { snomedConceptSelection } from './s_expression.ts'
import { Lang } from '../../shared/s_expression_schemas.ts'
import { ExpressionWrapper } from 'kysely'
import { DB } from '../../db.d.ts'

type SearchTerms = {
  // deno-lint-ignore no-explicit-any
  snomed_concept: Lang['snomed_concept'] | ExpressionWrapper<DB, any, string>
}

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
    .select((eb) => [
      literalString('attribute' as const).as('atom'),
      jsonBuildObject({
        atom: literalString('snomed_concept' as const),
        name: literalString(ATTRIBUTE.name),
        category: literalString(ATTRIBUTE.category),
      }).as('root_snomed_concept'),
      jsonBuildObject({
        atom: literalString('snomed_concept' as const),
        name: eb.ref('rel_type.name').$notNull(),
        category: eb.ref('rel_type.category').$notNull(),
      }).as('specific_snomed_concept'),
      jsonBuildObject({
        atom: literalString('snomed_concept' as const),
        name: eb.ref('rel_dest.name').$notNull(),
        category: eb.ref('rel_dest.category').$notNull(),
      }).as('value'),
    ])
    .orderBy('rel_type.name')
}

export const snomed_predefined_attributes = base({
  top_level_table: 'snomed_relationship',
  baseQuery,
  formatResult: identity<Lang['attribute']>,
})
