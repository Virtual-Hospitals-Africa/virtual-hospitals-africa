import z from 'zod'
import { parseTsvTyped } from '../../../util/parseCsv.ts'
import { define } from '../define.ts'
import { sql } from 'kysely'

const MeasurementReferenceRangeSchema = z.object({
  measurement_snomed_concept_id: z.string(),
  age_min_days: z.coerce.number().nullable(),
  age_max_days: z.coerce.number().nullable(),
  gender: z.string().nullable(),
  condition_codes: z.string().nullable(),
  normal_min: z.coerce.number(),
  normal_max: z.coerce.number(),
  critical_min: z.coerce.number().nullable(),
  critical_max: z.coerce.number().nullable(),
  units: z.string(),
  reference_source: z.string(),
  evidence_level: z.string().nullable(),
  clinical_context: z.string().nullable(),
})

export default define(['measurement_reference_ranges'], async (trx) => {
  for await (
    const row of parseTsvTyped(
      './db/seed/dumps/measurement_reference_ranges.tsv',
      MeasurementReferenceRangeSchema,
      { convert_to_snake_case: true },
    )
  ) {
    await trx
      .insertInto('measurement_reference_ranges')
      .values({
        measurement_snomed_concept_id: row.measurement_snomed_concept_id,
        age_min_days: row.age_min_days,
        age_max_days: row.age_max_days,
        gender: row.gender,
        condition_codes: row.condition_codes
          ? sql.raw<number[]>(row.condition_codes)
          : null,
        normal_min: row.normal_min,
        normal_max: row.normal_max,
        critical_min: row.critical_min,
        critical_max: row.critical_max,
        units: row.units,
        reference_source: row.reference_source,
        evidence_level: row.evidence_level,
        clinical_context: row.clinical_context,
      })
      .execute()
  }
})