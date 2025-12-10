import z from 'zod'
import { parseTsvTyped } from '../../../util/parseCsv.ts'
import { define } from '../define.ts'

const SatsTriageScoringRuleSchema = z.object({
  id: z.string(),
  scoring_system: z.string(),
  assessment_option_id: z.string().nullable(),
  finding_snomed_concept_id: z.string().nullable(),
  value_min: z.string().nullable().transform((val) =>
    val ? parseFloat(val) : null
  ),
  value_max: z.string().nullable().transform((val) =>
    val ? parseFloat(val) : null
  ),
  age_min_days: z.string().nullable().transform((val) =>
    val ? parseInt(val, 10) : null
  ),
  age_max_days: z.string().nullable().transform((val) =>
    val ? parseInt(val, 10) : null
  ),
  height_min_cm: z.string().nullable().transform((val) =>
    val ? parseInt(val, 10) : null
  ),
  height_max_cm: z.string().nullable().transform((val) =>
    val ? parseInt(val, 10) : null
  ),
  score_value: z.string().transform((val) => parseInt(val, 10)),
})

export default define(['sats_triage_scoring_rules'], async (trx) => {
  for await (
    const row of parseTsvTyped(
      './db/seed/dumps/sats_triage_scoring_rules.tsv',
      SatsTriageScoringRuleSchema,
      { convert_to_snake_case: true },
    )
  ) {
    await trx
      .insertInto('sats_triage_scoring_rules')
      .values({
        id: row.id,
        scoring_system: row.scoring_system,
        assessment_option_id: row.assessment_option_id,
        finding_snomed_concept_id: row.finding_snomed_concept_id,
        value_min: row.value_min,
        value_max: row.value_max,
        age_min_days: row.age_min_days,
        age_max_days: row.age_max_days,
        height_min_cm: row.height_min_cm,
        height_max_cm: row.height_max_cm,
        score_value: row.score_value,
      })
      .execute()
  }
})
