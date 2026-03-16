import { sql } from 'kysely'
import type { AgeDetermination } from '../../../db.d.ts'
import type { TrxOrDb, UnwrappedGenerator, WarningSign } from '../../../types.ts'
import { define } from '../define.ts'
import { findingQueryExpression, WARNING_SIGNS } from '../../../shared/warning_signs.ts'
import { isAtom, parseWithSchema } from '../../../shared/s_expression.ts'
import { any_query } from '../../../shared/s_expression_schemas.ts'
import { literalString } from '../../helpers.ts'
import { forEach } from '../../../util/inParallel.ts'
import { nameAndCategorySnomedConceptBase } from '../../models/s_expression.ts'
import { buildExpressionPredicate } from '../../models/s_expression_snomed_concepts.ts'
import { groupBy } from '../../../util/groupBy.ts'
import { toRecord } from '../../../util/toRecord.ts'
import { assert } from 'std/assert/assert.ts'

const AGE_DETERMINATIONS: AgeDetermination[] = ['adult', 'older child', 'younger child']

// In practice prompt_when_s_expression is only used for showing/not show
function signAppliesForPregnancyValues(sign: WarningSign): boolean[] {
  if (!sign.prompt_when_s_expression) return [true, false]
  assert(
    sign.prompt_when_s_expression === '(active_condition (snomed_concept "Pregnancy" "finding"))' ||
    sign.prompt_when_s_expression === '(not (active_condition (snomed_concept "Pregnancy" "finding")))'
  )
  const parsed = parseWithSchema(sign.prompt_when_s_expression, any_query)
  return isAtom(parsed, 'not') ? [false] : [true]
}

function * signs() {
  for (const age_determination of AGE_DETERMINATIONS) {
    const signs = WARNING_SIGNS[age_determination]
    if (!signs.length) continue
    for (const sign of signs) {
      // Parse the clinical_finding_s_expression to get the root SNOMED concept.
      // clinical_finding always parses to a finding node with root_snomed_concept = CLINICAL_FINDING.
      const parsed = parseWithSchema(sign.clinical_finding_s_expression, any_query)
      if (!isAtom(parsed, 'finding')) continue

      // Qualifiers can't be evaluated at concept level — these signs match nothing in this table.
      if (parsed.qualifiers.length > 0) continue

      const { specific_snomed_concept } = parsed
      if (!specific_snomed_concept) continue

      const pregnancy_values = signAppliesForPregnancyValues(sign)
      for (const pregnancy of pregnancy_values) {
        yield { pregnancy, age_determination, sign, specific_snomed_concept, parsed, priority: sign.priority }
      }
    }
  }
}

async function insert(trx: TrxOrDb, xs: Array<UnwrappedGenerator<ReturnType<typeof signs>>>) {
  await forEach(xs, async ({ pregnancy, age_determination, sign, specific_snomed_concept }) => {
    const { id } = await nameAndCategorySnomedConceptBase(trx, specific_snomed_concept).executeTakeFirstOrThrow()

    return trx
      .insertInto('snomed_concept_prioritizations')
      .columns(['id', 'age_determination', 'pregnancy', 'priority', 'warning_sign'])
      .expression(eb =>
        eb.selectFrom('snomed_inferred_canonical_name_and_category')
          .select([
            'snomed_inferred_canonical_name_and_category.id',
            sql`${sql.lit(age_determination)}::age_determination`.as('age_determination'),
            sql`${pregnancy}`.as('pregnancy'),
            sql`${sql.lit(sign.priority)}::warning_sign_priority`.as('priority'),
            literalString(sign.name).as('warning_sign'),
          ])
          .where(sql<boolean>`snomed_inferred_canonical_name_and_category.id IN (SELECT id FROM active_descendants(${id}))`)
          .where(eb_inner =>
            buildExpressionPredicate(
              eb_inner,
              'snomed_inferred_canonical_name_and_category.id',
              findingQueryExpression(sign),
            )
          )
      ).onConflict((oc) => oc.constraint('snomed_concept_prioritizations_pkey').doNothing())
      .execute()
  }, { concurrency: 8 })
}

export default define(
  ['snomed_concept_prioritizations'],
  async (trx) => {
    const signs_by_priority = toRecord(groupBy(signs(), 'priority'))
    await insert(trx, signs_by_priority['Emergency']!)
    await insert(trx, signs_by_priority['Very urgent']!)
    await insert(trx, signs_by_priority['Urgent']!)
  },
)
