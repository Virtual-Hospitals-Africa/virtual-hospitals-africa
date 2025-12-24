import z from 'zod'
import { parseTsvTyped } from '../../../util/parseCsv.ts'
import { define } from '../define.ts'
import { collect } from '../../../util/inParallel.ts'

const SatsTriageAssessmentOptionSchema = z.object({
  id: z.string(),
  assessment_snomed_concept_id: z.string(),
  option_snomed_concept_id: z.string(),
  display_label: z.string(),
  display_order: z.string().transform((val) => parseInt(val, 10)),
  ordinal_value: z.string().transform((val) => parseInt(val, 10)),
})

export default define(['sats_triage_assessment_options'], async (trx) => {
  const rows = await collect(parseTsvTyped(
    './db/resources/sats_triage_assessment_options.tsv',
    SatsTriageAssessmentOptionSchema,
    { convert_to_snake_case: true },
  ))
  await trx
    .insertInto('sats_triage_assessment_options')
    .values(rows)
    .execute()
})
