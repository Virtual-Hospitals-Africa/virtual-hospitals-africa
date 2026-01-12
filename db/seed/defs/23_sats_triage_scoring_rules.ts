import z from 'zod'
import { parseTsvTyped } from '../../../util/parseCsv.ts'
import { define } from '../define.ts'
import { collect } from '../../../util/inParallel.ts'

const SatsTriageScoringRuleSchema = z.object({
  id: z.string(),
  scoring_system: z.string(),
  assessment_option_id: z.string().nullable(),
  specific_snomed_concept_id: z.string().nullable(),
  value_min: z.string().nullable().transform((val) => val ? parseFloat(val) : null),
  value_max: z.string().nullable().transform((val) => val ? parseFloat(val) : null),
  age_min_days: z.string().nullable().transform((val) => val ? parseInt(val, 10) : null),
  age_max_days: z.string().nullable().transform((val) => val ? parseInt(val, 10) : null),
  height_min_cm: z.string().nullable().transform((val) => val ? parseInt(val, 10) : null),
  height_max_cm: z.string().nullable().transform((val) => val ? parseInt(val, 10) : null),
  score_value: z.string().transform((val) => parseInt(val, 10)),
})

export default define(['sats_triage_scoring_rules'], async (trx) => {
  const rows = await collect(parseTsvTyped(
    './db/resources/sats_triage_scoring_rules.tsv',
    SatsTriageScoringRuleSchema,
    { convert_to_snake_case: true },
  ))
  await trx
    .insertInto('sats_triage_scoring_rules')
    .values(rows)
    .execute()
})
