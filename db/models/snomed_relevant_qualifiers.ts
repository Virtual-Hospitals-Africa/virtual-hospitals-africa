import type { TrxOrDbOrQueryCreator } from '../../types.ts'
import { base, identity } from './_base.ts'
import { snomedConceptSelection } from './s_expression.ts'
import { finding_base, Lang } from '../../shared/s_expression_schemas.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { ExpressionWrapper } from 'kysely'
import { DB } from '../../db.d.ts'

type SearchTerms = {
  // deno-lint-ignore no-explicit-any
  snomed_concept: Lang['snomed_concept'] | ExpressionWrapper<DB, any, string>
}

function baseQuery(trx: TrxOrDbOrQueryCreator, { snomed_concept }: SearchTerms) {
  return trx
    .selectFrom('due_to_findings')
    .innerJoin('due_to', 'due_to.id', 'due_to_findings.id')
    .innerJoin('snomed_concept_active_descendants_realized', 'ancestor_id', 'due_to_findings.specific_snomed_concept_id')
    .where('due_to_findings.is_somehow_qualified', '=', true)
    .where('due_to_findings.value_snomed_concept_id', 'is', null)
    .where(
      'snomed_concept_active_descendants_realized.descendant_id',
      ...snomedConceptSelection(trx, snomed_concept),
    )
    .select('due_to.s_expression')
    .distinct()
}

export const snomed_relevant_qualifiers = base({
  top_level_table: 'due_to_findings',
  baseQuery,
  formatResult: identity,
  asUniqueQualifiers(raw: { s_expression: string }[]) {
    const all = raw.flatMap(({ s_expression }) => parseWithSchema(s_expression, finding_base).qualifiers)
    const seen = new Set<string>()
    return all.filter((q) => {
      const key = JSON.stringify(q)
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  },
  async distinct(trx: TrxOrDbOrQueryCreator, { snomed_concept }: SearchTerms) {
    const raw = await snomed_relevant_qualifiers.findAll(trx, { snomed_concept })
    return snomed_relevant_qualifiers.asUniqueQualifiers(raw)
  },
})
