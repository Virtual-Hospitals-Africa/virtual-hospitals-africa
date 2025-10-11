import { Measurement, Priority, TrxOrDb } from '../../types.ts'
import { PRIORITY_SNOMED_CODES } from '../../shared/priorities.ts'
import { VITALS_SNOMED_CODE } from '../../shared/vitals.ts'
import * as patient_clinical_context from './patient_clinical_context.ts'
import * as patient_evaluations from './patient_evaluations.ts'
import generateUUID from '../../util/uuid.ts'

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

export interface EvaluationResult {
  readonly measurement: Measurement
  readonly status: 'normal' | 'abnormal' | 'critical'
  readonly priority: Priority
  readonly clinical_note: string
  readonly applied_range: ReferenceRange | null
  readonly confidence: number
}

export interface AutomatedEvaluationResult {
  readonly created_evaluation_ids: readonly string[]
  readonly performance_metrics: {
    readonly database_queries: number
    readonly processing_time_ms: number
    readonly total_measurements: number
    readonly abnormal_count: number
  }
}

// TODO: I don't like this query at all
export async function getApplicableReferenceRanges(
  trx: TrxOrDb,
  {
    measurement_snomed_codes,
    patient_context,
  }: {
    measurement_snomed_codes: readonly string[]
    patient_context: patient_clinical_context.PatientClinicalContext
  },
): Promise<readonly ReferenceRange[]> {
  if (!measurement_snomed_codes.length) {
    return []
  }

  const patient_condition_bigints = patient_context
    .active_condition_snomed_codes
    .map((code) => BigInt(code))

  const results = await trx
    .selectFrom('measurement_reference_ranges as mrr')
    .selectAll('mrr')
    .select((eb) =>
      eb.fn.coalesce(
        eb.fn('array_length', ['mrr.condition_codes', eb.lit(1)]),
        eb.lit(0),
      ).as('condition_specificity')
    )
    .where(
      'mrr.measurement_snomed_concept_id',
      'in',
      measurement_snomed_codes.map((code) => BigInt(code)),
    )
    .where('mrr.active', '=', true)
    .where('mrr.effective_date', '<=', new Date())
    .where((eb) =>
      eb.or([
        eb('mrr.expiration_date', 'is', null),
        eb('mrr.expiration_date', '>', new Date()),
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
        eb('mrr.gender', '=', patient_context.gender),
      ])
    )
    .where((eb) => {
      if (patient_condition_bigints.length === 0) {
        return eb('mrr.condition_codes', 'is', null)
      }
      return eb.or([
        eb('mrr.condition_codes', 'is', null),
        sql`${
          sql.lit(patient_condition_bigints)
        }::bigint[] @> mrr.condition_codes`,
      ])
    })
    .orderBy('mrr.measurement_snomed_concept_id', 'asc')
    .orderBy('condition_specificity', 'desc')
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
    clinical_context: row.clinical_context,
  }))
}

function evaluateSingleMeasurement(
  measurement: Measurement,
  reference_ranges: readonly ReferenceRange[],
): EvaluationResult {
  const applicable_ranges = reference_ranges.filter((range) =>
    range.measurement_snomed_concept_id === measurement.snomed_concept_id
  )

  if (!applicable_ranges.length) {
    return {
      measurement,
      status: 'normal',
      priority: 'Normal',
      clinical_note: 'No reference range available for evaluation',
      applied_range: null,
      confidence: 0.1,
    }
  }

  const range = applicable_ranges[0]
  const value = measurement.value

  if (range.critical_min !== undefined && value < range.critical_min) {
    return {
      measurement,
      status: 'critical',
      priority: 'Emergency',
      clinical_note: `${
        getVitalLabelFromSnomedCode(measurement.snomed_concept_id)
      } critically low: ${value} ${range.units} (normal: ${range.normal_min}-${range.normal_max}, critical: <${range.critical_min})`,
      applied_range: range,
      confidence: 0.95,
    }
  }

  if (range.critical_max !== undefined && value > range.critical_max) {
    return {
      measurement,
      status: 'critical',
      priority: 'Emergency',
      clinical_note: `${
        getVitalLabelFromSnomedCode(measurement.snomed_concept_id)
      } critically high: ${value} ${range.units} (normal: ${range.normal_min}-${range.normal_max}, critical: >${range.critical_max})`,
      applied_range: range,
      confidence: 0.95,
    }
  }

  if (value >= range.normal_min && value <= range.normal_max) {
    return {
      measurement,
      status: 'normal',
      priority: 'Normal',
      clinical_note: `${
        getVitalLabelFromSnomedCode(measurement.snomed_concept_id)
      } within normal range: ${value} ${range.units} (${range.normal_min}-${range.normal_max})`,
      applied_range: range,
      confidence: 0.9,
    }
  }

  const priority = calculatePriorityFromDeviation(value, range)
  const deviation_description = value < range.normal_min ? 'low' : 'high'

  return {
    measurement,
    status: 'abnormal',
    priority,
    clinical_note: `${
      getVitalLabelFromSnomedCode(measurement.snomed_concept_id)
    } ${deviation_description}: ${value} ${range.units} (normal: ${range.normal_min}-${range.normal_max})`,
    applied_range: range,
    confidence: 0.85,
  }
}

/**
 * Calculates priority based on how far the value deviates from normal range
 * We kinda need this because we have 5 flags but ranges come in normal - abnormal - critical. 
 * 
 * TODO:
 * Discuss this with Dr. Sikhu and Will
 */
function calculatePriorityFromDeviation(
  value: number,
  range: ReferenceRange,
): Priority {
  const normal_range_size = range.normal_max - range.normal_min
  const center = (range.normal_min + range.normal_max) / 2

  const deviation_from_center = Math.abs(value - center)
  const relative_deviation = deviation_from_center / normal_range_size

  
  if (relative_deviation > 1.0) return 'Urgent'
  if (relative_deviation > 0.5) return 'Non-urgent'
  return 'Normal'
}

export async function evaluateAndCreateSystemEvaluations(
  trx: TrxOrDb,
  {
    patient_id,
    _encounter_id,
    measurements,
    patient_context,
  }: {
    patient_id: string
    _encounter_id: string
    measurements: readonly Measurement[]
    patient_context?: patient_clinical_context.PatientClinicalContext
  },
): Promise<AutomatedEvaluationResult> {
  const start_time = Date.now()
  let database_queries = 0

  let context = patient_context
  if (!context) {
    context = await patient_clinical_context.buildPatientClinicalContext(
      trx,
      patient_id,
    )
    database_queries += 2
  }

  const reference_ranges = await getApplicableReferenceRanges(trx, {
    measurement_snomed_codes: measurements.map((m) => m.snomed_concept_id),
    patient_context: context,
  })
  database_queries += 1

  const evaluation_results = measurements.map((measurement) =>
    evaluateSingleMeasurement(measurement, reference_ranges)
  )

  const system_evaluations = evaluation_results.map((result) => ({
    finding_id: result.measurement.finding_id,
    priority: result.priority,
    clinical_note: result.clinical_note,
    reference_range_source: result.applied_range?.reference_source,
    confidence: result.confidence,
  }))

  let created_evaluation_ids: string[] = []
  if (system_evaluations.length > 0) {
    const insert_result = await patient_evaluations.insertSystemEvaluations(
      trx,
      {
        patient_id,
        encounter_id: _encounter_id,
        evaluations: system_evaluations,
      },
    )
    created_evaluation_ids = insert_result.evaluation_ids
    database_queries += 2 
  }

  const processing_time_ms = Date.now() - start_time
  const abnormal_count =
    evaluation_results.filter((r) => r.status !== 'normal').length

  return {
    created_evaluation_ids,
    performance_metrics: {
      database_queries,
      processing_time_ms,
      total_measurements: measurements.length,
      abnormal_count,
    },
  }
}

function getVitalLabelFromSnomedCode(snomed_concept_id: string): string {
  const label_map: Record<string, string> = {
    [VITALS_SNOMED_CODE.temperature]: 'temperature',
    [VITALS_SNOMED_CODE.pulse]: 'pulse',
    [VITALS_SNOMED_CODE.respiratory_rate]: 'respiratory_rate',
    [VITALS_SNOMED_CODE.height]: 'height',
    [VITALS_SNOMED_CODE.weight]: 'weight',
    [VITALS_SNOMED_CODE.blood_pressure_systolic]: 'blood_pressure_systolic',
    [VITALS_SNOMED_CODE.blood_pressure_diastolic]: 'blood_pressure_diastolic',
    [VITALS_SNOMED_CODE.blood_oxygen_saturation]: 'blood_oxygen_saturation',
    [VITALS_SNOMED_CODE.blood_glucose]: 'blood_glucose',
    [VITALS_SNOMED_CODE.head_circumference]: 'head_circumference',
    [VITALS_SNOMED_CODE.midarm_circumference]: 'midarm_circumference',
    [VITALS_SNOMED_CODE.triceps_skinfold]: 'triceps_skinfold',
  }

  return label_map[snomed_concept_id] || `measurement_${snomed_concept_id}`
}
