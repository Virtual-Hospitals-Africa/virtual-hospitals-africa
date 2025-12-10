import { sql } from 'kysely'
import { TrxOrDb } from '../../types.ts'
import { literalString } from '../helpers.ts'

export async function readRows(
  trx: TrxOrDb,
  procedure_id: string,
): Promise<RenderedTriageVitalRow[]> {
  // First, get the patient_id from the procedure to fetch reference ranges

  const procedure_info = await trx
    .selectFrom('patient_procedures')
    .innerJoin('patient_records', 'patient_records.id', 'patient_procedures.id')
    .where('patient_procedures.id', '=', procedure_id)
    .select(['patient_records.patient_id'])
    .executeTakeFirst()

  if (!procedure_info) {
    throw new Error(`Procedure ${procedure_id} not found`)
  }

  const results = await trx.selectFrom('patient_findings')
    .innerJoin(
      'patient_records',
      'patient_findings.id',
      'patient_records.id',
    )
    .innerJoin(
      'snomed_inferred_canonical_name_and_category',
      'snomed_inferred_canonical_name_and_category.id',
      'patient_records.snomed_concept_id',
    )
    .leftJoin(
      'patient_computed_findings as self_patient_computed_findings',
      'patient_findings.id',
      'self_patient_computed_findings.id',
    )
    .leftJoin(
      'patient_computed_findings_inputs',
      'patient_findings.id',
      'patient_computed_findings_inputs.input_measurement_id',
    )
    .leftJoin(
      'patient_computed_findings as computation_based_on_self',
      'computation_based_on_self.id',
      'patient_computed_findings_inputs.computed_finding_id',
    )
    .leftJoin(
      'patient_measurements',
      'patient_measurements.id',
      'patient_findings.id',
    )
    .where('patient_findings.procedure_id', '=', procedure_id)
    .select([
      literalString('triage_vital').as('type'),

      sql<string>`patient_records.snomed_concept_id::text`.as(
        'snomed_concept_id',
      ),

      sql<string>`patient_records.id`.as('patient_record_id'),

      // This expression creates a grouping key. For a computed finding (e.g., BMI),

      // both the computed finding itself and its inputs (e.g., height, weight)

      // will share the same `finding_computation_group_id`, which is the ID of the

      // computed finding record. This allows grouping them together in the UI.

      sql<string>`coalesce(computation_based_on_self.id, patient_findings.id)`
        .as('finding_computation_group_id'),

      'snomed_inferred_canonical_name_and_category.canonical_name as display_name',

      sql<string>`

CASE

WHEN patient_measurements.value IS NOT NULL

THEN CASE

WHEN patient_measurements.units = '' THEN patient_measurements.value::text

ELSE CONCAT(patient_measurements.value::text, ' ', patient_measurements.units)

END

WHEN self_patient_computed_findings.value_display IS NOT NULL

THEN self_patient_computed_findings.value_display

WHEN self_patient_computed_findings.value IS NOT NULL

THEN CASE

WHEN self_patient_computed_findings.units = '' THEN self_patient_computed_findings.value::text

ELSE CONCAT(self_patient_computed_findings.value::text, ' ', self_patient_computed_findings.units)

END

ELSE 'N/A'

END

`.as('measurement_display'),

      // Get the numeric value for score calculation

      sql<number | null>`

CASE

WHEN patient_measurements.value IS NOT NULL

THEN patient_measurements.value::numeric

WHEN self_patient_computed_findings.value IS NOT NULL

THEN self_patient_computed_findings.value::numeric

ELSE NULL

END

`.as('numeric_value'),

      sql<string>`patient_records.patient_id`.as('patient_id'),
    ])
    .execute()

  // Map results to RenderedTriageVitalRow

  return results.map((result) => {
    return {
      type: 'triage_vital' as const,
      snomed_concept_id: result.snomed_concept_id,
      patient_record_id: result.patient_record_id,
      finding_computation_group_id: result.finding_computation_group_id,
      display_name: result.display_name,
      measurement_display: result.measurement_display,
      reference_range: { normal_min: 0, normal_max: 0 },
      system_evaluation: null,
      notes: null,
      score: 0,
    }
  })
}
