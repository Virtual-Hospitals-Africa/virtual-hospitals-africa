import z from 'zod'
import { parseTsvTyped } from '../../../util/parseCsv.ts'
import { define } from '../define.ts'

const SatsTriageAssessmentOptionSchema = z.object({
  id: z.string(),
  assessment_snomed_id: z.string(),
  option_snomed_concept_id: z.string(),
  display_label: z.string(),
  display_order: z.string().transform((val) => parseInt(val, 10)),
  ordinal_value: z.string().transform((val) => parseInt(val, 10)),
})

export default define(['sats_triage_assessment_options'], async (trx) => {
  for await (
    const row of parseTsvTyped(
      './db/seed/dumps/sats_triage_assessment_options.tsv',
      SatsTriageAssessmentOptionSchema,
      { convert_to_snake_case: true },
    )
  ) {
    await trx
      .insertInto('sats_triage_assessment_options')
      .values({
        id: row.id,
        assessment_snomed_id: row.assessment_snomed_id,
        option_snomed_concept_id: row.option_snomed_concept_id,
        display_label: row.display_label,
        display_order: row.display_order,
        ordinal_value: row.ordinal_value,
      })
      .execute()
  }
})