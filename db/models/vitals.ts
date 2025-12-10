import * as patient_measurements from './patient_measurements.ts'
import * as patient_computed_findings from './patient_computed_findings.ts'
import * as patient_categorical_findings from './patient_categorical_findings.ts'
import * as clinical_measurement_requirements from './clinical_measurement_requirements.ts'
import {
  Measurement,
  RenderedPatient,
  TrxOrDb,
  VitalMeasurementFormInputDefition,
} from '../../types.ts'
import { TAKING_PATIENT_VITAL_SIGNS_SNOMED_CODE } from '../../shared/vitals.ts'
import { blankSelection, literalString } from '../helpers.ts'
import { sql } from 'kysely'
import type { CategoricalAssessment } from './patient_categorical_findings.ts'
import generateUUID from '../../util/uuid.ts'

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
 * Insert both quantitative measurements AND categorical assessments
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
}> {
  const procedure_snomed_code = TAKING_PATIENT_VITAL_SIGNS_SNOMED_CODE
  const procedure_id = generateUUID()

  // Single CTE: procedure + measurements + assessments
  await trx
    .with(
      'inserting_procedure_record',
      (qb) =>
        qb.insertInto('patient_records').values({
          id: procedure_id,
          patient_id: opts.patient_id,
          patient_encounter_id: opts.patient_encounter_id,
          snomed_concept_id: procedure_snomed_code,
        }),
    )
    .with(
      'inserting_procedure',
      (qb) =>
        qb.insertInto('patient_procedures').values({
          id: procedure_id,
          patient_encounter_employee_id: opts.patient_encounter_employee_id,
        }),
    )
    .with(
      'inserting_measurement_records',
      (qb) =>
        opts.input_measurements.length
          ? qb.insertInto('patient_records').values(
            opts.input_measurements.map((m) => ({
              id: m.finding_id,
              patient_id: opts.patient_id,
              patient_encounter_id: opts.patient_encounter_id,
              snomed_concept_id: m.snomed_concept_id,
            })),
          )
          : blankSelection(qb),
    )
    .with(
      'inserting_measurement_findings',
      (qb) =>
        opts.input_measurements.length
          ? qb.insertInto('patient_findings').values(
            opts.input_measurements.map((m) => ({
              id: m.finding_id,
              procedure_id,
              patient_encounter_employee_id: opts.patient_encounter_employee_id,
            })),
          )
          : blankSelection(qb),
    )
    .with(
      'inserting_measurements',
      (qb) =>
        opts.input_measurements.length
          ? qb.insertInto('patient_measurements').values(
            opts.input_measurements.map((m) => ({
              id: m.finding_id,
              value: m.value,
              units: m.units,
            })),
          )
          : blankSelection(qb),
    )
    .with(
      'inserting_assessment_records',
      (qb) =>
        opts.input_assessments.length
          ? qb.insertInto('patient_records').values(
            opts.input_assessments.map((a) => ({
              id: a.finding_id,
              patient_id: opts.patient_id,
              patient_encounter_id: opts.patient_encounter_id,
              snomed_concept_id: a.option_snomed_concept_id,
            })),
          )
          : blankSelection(qb),
    )
    .with(
      'inserting_assessment_findings',
      (qb) =>
        opts.input_assessments.length
          ? qb.insertInto('patient_findings').values(
            opts.input_assessments.map((a) => ({
              id: a.finding_id,
              procedure_id,
              patient_encounter_employee_id: opts.patient_encounter_employee_id,
            })),
          )
          : blankSelection(qb),
    )
    .with(
      'inserting_categorical_findings',
      (qb) =>
        opts.input_assessments.length
          ? qb.insertInto('patient_categorical_findings').values(
            opts.input_assessments.map((a) => ({
              id: a.finding_id,
            })),
          )
          : blankSelection(qb),
    )
    .selectNoFrom([literalString(procedure_id).as('procedure_id')])
    .executeTakeFirst()

  if (opts.input_measurements.length) {
    await patient_computed_findings.computeAndInsertDerivedMeasurements(trx, {
      patient_id: opts.patient_id,
      patient_encounter_id: opts.patient_encounter_id,
      patient_encounter_employee_id: opts.patient_encounter_employee_id,
      source_measurements: opts.input_measurements,
      source_procedure_id: procedure_id,
    })
  }

  return { success: true, procedure_id }
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



