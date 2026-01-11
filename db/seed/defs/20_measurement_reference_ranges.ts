import z from 'zod'
import { parseTsvTyped } from '../../../util/parseCsv.ts'
import { define } from '../define.ts'
import { sql } from 'kysely'
import { collect } from '../../../util/inParallel.ts'

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
  const rows = await collect(parseTsvTyped(
    './db/resources/measurement_reference_ranges.tsv',
    MeasurementReferenceRangeSchema,
    { convert_to_snake_case: true },
  ))
  await trx
    .insertInto('measurement_reference_ranges')
    .values(rows.map((row) => ({
      ...row,
      condition_codes: row.condition_codes ? sql.raw<number[]>(row.condition_codes) : null,
    })))
    .execute()
})
