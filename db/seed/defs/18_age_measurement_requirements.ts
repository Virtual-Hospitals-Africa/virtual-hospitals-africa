import z from 'zod'
import { parseTsvTyped } from '../../../util/parseCsv.ts'
import { define } from '../define.ts'

const AgeMeasurementRequirementSchema = z.object({
  age_min_days: z.coerce.number().nullable(),
  age_max_days: z.coerce.number().nullable(),
  required_measurement_snomed_concept_id: z.string(),
  medical_standard: z.string(),
  clinical_rationale: z.string(),
  is_required: z.string().transform((val) => val === 't'),
})

export default define(['age_measurement_requirements'], async (trx) => {
  for await (
    const row of parseTsvTyped(
      './db/seed/dumps/age_measurement_requirements.tsv',
      AgeMeasurementRequirementSchema,
      { convert_to_snake_case: true },
    )
  ) {
    await trx
      .insertInto('age_measurement_requirements')
      .values({
        age_min_days: row.age_min_days,
        age_max_days: row.age_max_days,
        required_measurement_snomed_concept_id:
          row.required_measurement_snomed_concept_id,
        medical_standard: row.medical_standard,
        clinical_rationale: row.clinical_rationale,
        is_required: row.is_required,
      })
      .execute()
  }
})
