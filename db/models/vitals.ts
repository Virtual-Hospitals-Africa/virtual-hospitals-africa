import * as patient_measurements from './patient_measurements.ts'
import * as patient_computed_findings from './patient_computed_findings.ts'
import * as clinical_measurement_requirements from './clinical_measurement_requirements.ts'
import * as patient_clinical_context from './patient_clinical_context.ts'
import * as automated_evaluation from './automated_evaluation.ts'
import {
  Measurement,
  TrxOrDb,
  VitalMeasurementFormInputDefition,
} from '../../types.ts'
import { TAKING_PATIENT_VITAL_SIGNS_SNOMED_CODE } from '../../shared/vitals.ts'

type PatientRecord = {
  id: string
  age_years?: number | null
  age_number?: number | null
  age_unit?: string | null
  gender?: string | null
}

export async function insertMeasurements(
  trx: TrxOrDb,
  opts: {
    patient_id: string
    encounter_id: string
    encounter_provider_id: string
    input_measurements: Measurement[]
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
  const start_time = Date.now()

  const insertion_result = await patient_measurements.insertMany(trx, {
    ...opts,
    procedure: {
      create_from_snomed_concept_id: TAKING_PATIENT_VITAL_SIGNS_SNOMED_CODE,
    },
  })

  let auto_evaluations: string[] = []
  let performance_metrics: {
    evaluation_time_ms: number
    database_queries: number
    abnormal_measurements: number
  } | undefined = undefined

  if (opts.input_measurements.length) {
    const clinical_context = await patient_clinical_context
      .buildPatientClinicalContext(
        trx,
        opts.patient_id,
      )

    const evaluation_result = await automated_evaluation
      .evaluateAndCreateSystemEvaluations(
        trx,
        {
          patient_id: opts.patient_id,
          _encounter_id: opts.encounter_id,
          measurements: opts.input_measurements,
          patient_context: clinical_context,
        },
      )

    auto_evaluations = [...evaluation_result.created_evaluation_ids]
    performance_metrics = {
      evaluation_time_ms: Date.now() - start_time,
      database_queries: evaluation_result.performance_metrics.database_queries,
      abnormal_measurements:
        evaluation_result.performance_metrics.abnormal_count,
    }
  }

  await patient_computed_findings.computeAndInsertDerivedMeasurements(trx, {
    patient_id: opts.patient_id,
    encounter_id: opts.encounter_id,
    encounter_provider_id: opts.encounter_provider_id,
    source_measurements: opts.input_measurements,
    source_procedure_id: insertion_result.procedure_id,
  })

  return {
    success: true,
    procedure_id: insertion_result.procedure_id,
    auto_evaluations: auto_evaluations.length > 0
      ? auto_evaluations
      : undefined,
    performance_metrics,
  }
}

export async function measurementsNeededForEncounter(
  trx: TrxOrDb,
  patient_record: PatientRecord,
): Promise<VitalMeasurementFormInputDefition[]> {
  const clinical_context = await patient_clinical_context
    .buildPatientClinicalContext(
      trx,
      patient_record.id,
    )

  const requirements_result = await clinical_measurement_requirements
    .determineMeasurementsForPatient(trx, clinical_context)

  return requirements_result.measurements
}
