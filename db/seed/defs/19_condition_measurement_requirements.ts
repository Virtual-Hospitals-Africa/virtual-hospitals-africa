import z from 'zod'
import { parseTsvTyped } from '../../../util/parseCsv.ts'
import { define } from '../define.ts'

const ConditionMeasurementRequirementSchema = z.object({
  condition_snomed_concept_id: z.string(),
  required_measurement_snomed_concept_id: z.string(),
  medical_standard: z.string(),
  clinical_rationale: z.string(),
  is_required: z.string().transform((val) => val === 't'),
  frequency_recommendation: z.string().nullable(),
})

export default define(['condition_measurement_requirements'], async (trx) => {
  for await (
    const row of parseTsvTyped(
      './db/seed/dumps/condition_measurement_requirements.tsv',
      ConditionMeasurementRequirementSchema,
      { convert_to_snake_case: true },
    )
  ) {
    await trx
      .insertInto('condition_measurement_requirements')
      .values({
        condition_snomed_concept_id: row.condition_snomed_concept_id,
        required_measurement_snomed_concept_id:
          row.required_measurement_snomed_concept_id,
        medical_standard: row.medical_standard,
        clinical_rationale: row.clinical_rationale,
        is_required: row.is_required,
        frequency_recommendation: row.frequency_recommendation,
      })
      .execute()
  }
})