import { TrxOrDb } from '../../types.ts'
import { sql } from 'kysely'
import { now } from '../helpers.ts'

export interface ReferenceRange {
  readonly measurement_snomed_concept_id: string
  readonly condition_codes?: readonly string[]
  readonly normal_min: number
  readonly normal_max: number
  readonly critical_min?: number
  readonly critical_max?: number
  readonly units: string
  readonly reference_source: string
  readonly evidence_level?: string
  readonly clinical_context: string
}

// TODO: Add condition-based filtering once we define how pre-existing conditions will be modeled
// For now, only matching by age and gender
export async function getApplicableReferenceRanges(
  trx: TrxOrDb,
  {
    measurement_snomed_codes,
    patient_context,
  }: {
    measurement_snomed_codes: readonly string[]
    patient_context: {
      age_days: number
      gender: string | null
    }
  },
): Promise<readonly ReferenceRange[]> {
  if (!measurement_snomed_codes.length) {
    return []
  }

  const results = await trx
    .selectFrom('measurement_reference_ranges as mrr')
    .selectAll('mrr')
    .where(
      'mrr.measurement_snomed_concept_id',
      'in',
      measurement_snomed_codes,
    )
    .where('mrr.active', '=', true)
    .where('mrr.effective_date', '<=', now)
    .where('mrr.condition_codes', 'is', null) // Only general ranges for now
    .where((eb) =>
      eb.or([
        eb('mrr.expiration_date', 'is', null),
        eb('mrr.expiration_date', '>', now),
      ])
    )
    .where((eb) =>
      eb.or([
        eb('mrr.age_min_days', 'is', null),
        eb('mrr.age_min_days', '<=', patient_context.age_days),
      ])
    )
    .where((eb) =>
      eb.or([
        eb('mrr.age_max_days', 'is', null),
        eb('mrr.age_max_days', '>=', patient_context.age_days),
      ])
    )
    .where((eb) =>
      eb.or([
        eb('mrr.gender', 'is', null),
        patient_context.gender
          ? eb('mrr.gender', '=', patient_context.gender)
          : eb.val(false), // If patient gender is unknown, only match records where gender is null
      ])
    )
    .orderBy('mrr.measurement_snomed_concept_id', 'asc')
    .orderBy('mrr.reference_source', 'asc')
    .execute()

  return results.map((row): ReferenceRange => ({
    measurement_snomed_concept_id: row.measurement_snomed_concept_id.toString(),
    condition_codes: row.condition_codes?.map((code) => code.toString()),
    normal_min: parseFloat(row.normal_min.toString()),
    normal_max: parseFloat(row.normal_max.toString()),
    critical_min: row.critical_min
      ? parseFloat(row.critical_min.toString())
      : undefined,
    critical_max: row.critical_max
      ? parseFloat(row.critical_max.toString())
      : undefined,
    units: row.units,
    reference_source: row.reference_source,
    evidence_level: row.evidence_level || undefined,
    clinical_context: row.clinical_context ?? '',
  }))
}
