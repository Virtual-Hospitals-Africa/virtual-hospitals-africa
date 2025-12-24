import z from 'zod'
import { parseTsvTyped } from '../../../util/parseCsv.ts'
import { define } from '../define.ts'
import { collect } from '../../../util/inParallel.ts'

const ConditionMeasurementRequirementSchema = z.object({
  condition_snomed_concept_id: z.string(),
  required_measurement_snomed_concept_id: z.string(),
  medical_standard: z.string(),
  clinical_rationale: z.string(),
  is_required: z.string().transform((val) => val === 't'),
  frequency_recommendation: z.string().nullable(),
})

export default define(['condition_measurement_requirements'], async (trx) => {
  const rows = await collect(parseTsvTyped(
    './db/resources/condition_measurement_requirements.tsv',
    ConditionMeasurementRequirementSchema,
    { convert_to_snake_case: true },
  ))
  await trx
    .insertInto('condition_measurement_requirements')
    .values(rows)
    .execute()
})
