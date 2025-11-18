import * as patient_measurements from './patient_measurements.ts'
import * as patient_computed_findings from './patient_computed_findings.ts'
import * as patient_categorical_findings from './patient_categorical_findings.ts'
import * as clinical_measurement_requirements from './clinical_measurement_requirements.ts'
import {
  Measurement,
  RenderedPatient,
  RenderedTriageVitalRow,
  TrxOrDb,
  VitalMeasurementFormInputDefition,
} from '../../types.ts'
import { TAKING_PATIENT_VITAL_SIGNS_SNOMED_CODE } from '../../shared/vitals.ts'
import { literalString } from '../helpers.ts'
import { sql } from 'kysely'
import type { CategoricalAssessment } from './patient_categorical_findings.ts'

export async function insertMeasurements(
  trx: TrxOrDb,
  opts: {
    patient_record: RenderedPatient
    patient_id: string
    patient_encounter_id: string
    patient_encounter_employee_id: string
    input_measurements: Measurement[]
    active_condition_snomed_codes: readonly string[]
  },
): Promise<{
  success: true
  procedure_id: string
  auto_evaluations?: string[]
  performance_metrics?: {
    evaluation_time_ms: number
    database_queries: number
    abnormal_measurements: number
  }
}> {
  const insertion_result = await patient_measurements.insertMany(trx, {
    ...opts,
    procedure: {
      create_from_snomed_concept_id: TAKING_PATIENT_VITAL_SIGNS_SNOMED_CODE,
    },
  })

  await patient_computed_findings.computeAndInsertDerivedMeasurements(trx, {
    patient_id: opts.patient_id,
    patient_encounter_id: opts.patient_encounter_id,
    patient_encounter_employee_id: opts.patient_encounter_employee_id,
    source_measurements: opts.input_measurements,
    source_procedure_id: insertion_result.procedure_id,
  })

  return {
    success: true,
    procedure_id: insertion_result.procedure_id,
  }
}

export async function measurementsNeededForEncounter(
  trx: TrxOrDb,
  patient_record: RenderedPatient,
  active_condition_snomed_codes: readonly string[],
): Promise<VitalMeasurementFormInputDefition[]> {
  const requirements_result = await clinical_measurement_requirements
    .determineMeasurementsForPatient(trx, {
      patient_id: patient_record.id,
      age_days: patient_record.age_days ?? 0,
      gender: patient_record.gender,
      active_condition_snomed_codes,
      pregnancy_status: active_condition_snomed_codes.includes('77386006'),
    })

  return requirements_result.measurements
}

/**
 * NEW: Insert both quantitative measurements AND categorical assessments
 * This is the new unified function that handles AVPU/Mobility/Trauma as categorical findings
 */
export async function insertMeasurementsAndAssessments(
  trx: TrxOrDb,
  opts: {
    patient_record: RenderedPatient
    patient_id: string
    patient_encounter_id: string
    patient_encounter_employee_id: string
    input_measurements: Measurement[]
    input_assessments: CategoricalAssessment[]
    active_condition_snomed_codes: readonly string[]
  },
): Promise<{
  success: true
  procedure_id: string
  auto_evaluations?: string[]
  performance_metrics?: {
    evaluation_time_ms: number
    database_queries: number
    abnormal_measurements: number
  }
}> {
  const procedure_snomed_code = TAKING_PATIENT_VITAL_SIGNS_SNOMED_CODE

  // Insert quantitative measurements (if any)
  let procedure_id: string
  if (opts.input_measurements.length) {
    const measurement_result = await patient_measurements.insertMany(trx, {
      ...opts,
      procedure: {
        create_from_snomed_concept_id: procedure_snomed_code,
      },
    })
    procedure_id = measurement_result.procedure_id
  } else {
    // Create procedure for assessments only
    const assessment_result = await patient_categorical_findings.insertMany(
      trx,
      {
        input_assessments: opts.input_assessments,
        patient_id: opts.patient_id,
        patient_encounter_id: opts.patient_encounter_id,
        patient_encounter_employee_id: opts.patient_encounter_employee_id,
        procedure: {
          create_from_snomed_concept_id: procedure_snomed_code,
        },
      },
    )
    procedure_id = assessment_result.procedure_id
  }

  // Insert categorical assessments (if any and we have a procedure)
  if (opts.input_assessments.length && opts.input_measurements.length) {
    await patient_categorical_findings.insertMany(trx, {
      input_assessments: opts.input_assessments,
      patient_id: opts.patient_id,
      patient_encounter_id: opts.patient_encounter_id,
      patient_encounter_employee_id: opts.patient_encounter_employee_id,
      procedure: {
        id: procedure_id, // Reuse same procedure
        create_from_snomed_concept_id: procedure_snomed_code,
      },
    })
  }

  // Compute derived measurements (BMI, MAP, etc.)
  if (opts.input_measurements.length) {
    await patient_computed_findings
      .computeAndInsertDerivedMeasurements(trx, {
        patient_id: opts.patient_id,
        patient_encounter_id: opts.patient_encounter_id,
        patient_encounter_employee_id: opts.patient_encounter_employee_id,
        source_measurements: opts.input_measurements,
        source_procedure_id: procedure_id,
      })
  }

  return {
    success: true,
    procedure_id,
  }
}

export async function measurementsNeededForTriageEncounter(
  trx: TrxOrDb,
  patient_record: RenderedPatient,
  active_condition_snomed_codes: readonly string[],
): Promise<VitalMeasurementFormInputDefition[]> {
  // Get regular vital measurements based on clinical context
  // AVPU/Mobility/Trauma are now handled by database-driven categorical assessments
  return await measurementsNeededForEncounter(
    trx,
    patient_record,
    active_condition_snomed_codes,
  )
}

/**
 * Reads triage vital rows from a procedure, computing reference ranges and evaluations at the database level.
 * This function groups computed findings with their input measurements for proper display ordering.
 *
 * Note: This function currently returns a simplified reference range structure based on the existing
 * measurement_reference_ranges table schema which has normal_min, normal_max, critical_min, and critical_max.
 * The ReferenceRange type expects multi-level abnormal ranges which would require schema changes.
 */
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