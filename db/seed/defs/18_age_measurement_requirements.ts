import z from 'zod'
import { parseTsvTyped } from '../../../util/parseCsv.ts'
import { define } from '../define.ts'
import { collect } from '../../../util/inParallel.ts'

const AgeMeasurementRequirementSchema = z.object({
  age_min_days: z.coerce.number().nullable(),
  age_max_days: z.coerce.number().nullable(),
  required_measurement_snomed_concept_id: z.string(),
  medical_standard: z.string(),
  clinical_rationale: z.string(),
  is_required: z.string().transform((val) => val === 't'),
})

export default define(['age_measurement_requirements'], async (trx) => {
  const rows = await collect(parseTsvTyped(
    './db/resources/age_measurement_requirements.tsv',
    AgeMeasurementRequirementSchema,
    { convert_to_snake_case: true },
  ))
  await trx
    .insertInto('age_measurement_requirements')
    .values(rows)
    .execute()
})
