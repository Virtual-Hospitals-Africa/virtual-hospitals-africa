import z from 'zod'
import { parseTsvTyped } from '../../../util/parseCsv.ts'
import { define } from '../define.ts'
import { VITAL_ASSESSMENTS_EVALUATION_SNOMED_CONCEPTS } from '../../../shared/vitals.ts'
import keys from '../../../util/keys.ts'
import { collect } from '../../../util/inParallel.ts'

const SatsTriageAssessmentSchema = z.object({
  assessment_snomed_concept_id: z.string(),
  vital: z.enum(keys(VITAL_ASSESSMENTS_EVALUATION_SNOMED_CONCEPTS)),
  category: z.string(),
  display_order: z.string().transform((val) => parseInt(val, 10)),
  required_for_triage: z.string().transform((val) => val === 't'),
})

export default define(['sats_triage_assessments'], async (trx) => {
  const rows = await collect(parseTsvTyped(
    './db/resources/sats_triage_assessments.tsv',
    SatsTriageAssessmentSchema,
    { convert_to_snake_case: true },
  ))
  await trx
    .insertInto('sats_triage_assessments')
    .values(rows)
    .execute()
})
