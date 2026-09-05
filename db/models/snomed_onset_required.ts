import type { TrxOrDbOrQueryCreator } from '../../types.ts'
import { base, identity } from './_base.ts'
import { snomedConceptSelection } from './s_expression.ts'
import { Lang } from '../../shared/s_expression_schemas.ts'
import { ExpressionWrapper } from 'kysely'
import { DB } from '../../db.d.ts'

type SearchTerms = {
  // deno-lint-ignore no-explicit-any
  snomed_concept: Lang['snomed_concept'] | ExpressionWrapper<DB, any, string>
}

/*
  A finding requires an onset when some rule compares the time of the matching
  event against a duration (due_to_event_time_comparisons). Callers only check
  for the existence of a matching row, typically via eb.exists(baseQuery(...)).
*/
function baseQuery(trx: TrxOrDbOrQueryCreator, { snomed_concept }: SearchTerms) {
  return trx
    .selectFrom('due_to_event_time_comparisons')
    .innerJoin('snomed_concept_active_descendants_realized', 'ancestor_id', 'due_to_event_time_comparisons.specific_snomed_concept_id')
    .where(
      'snomed_concept_active_descendants_realized.descendant_id',
      ...snomedConceptSelection(trx, snomed_concept),
    )
    .select('due_to_event_time_comparisons.id')
}

export const snomed_onset_required = base({
  top_level_table: 'due_to_event_time_comparisons',
  baseQuery,
  formatResult: identity,
  async check(trx: TrxOrDbOrQueryCreator, terms: SearchTerms): Promise<boolean> {
    const row = await baseQuery(trx, terms).limit(1).executeTakeFirst()
    return !!row
  },
})
