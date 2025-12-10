import z from 'zod'
import { parseTsvTyped } from '../../../util/parseCsv.ts'
import { define } from '../define.ts'

const SatsTriageAssessmentSchema = z.object({
  assessment_snomed_id: z.string(),
  name: z.string(),
  category: z.string(),
  display_order: z.string().transform((val) => parseInt(val, 10)),
  required_for_triage: z.string().transform((val) => val === 't'),
})

export default define(['sats_triage_assessments'], async (trx) => {
  for await (
    const row of parseTsvTyped(
      './db/seed/dumps/sats_triage_assessments.tsv',
      SatsTriageAssessmentSchema,
      { convert_to_snake_case: true },
    )
  ) {
    await trx
      .insertInto('sats_triage_assessments')
      .values({
        assessment_snomed_id: row.assessment_snomed_id,
        name: row.name,
        category: row.category,
        display_order: row.display_order,
        required_for_triage: row.required_for_triage,
      })
      .execute()
  }
})
