import { Sex, TrxOrDb, VitalMeasurementFormInputDefition } from '../../types.ts'
import { VITALS_SNOMED_CODE, VITALS_UNITS } from '../../shared/vitals.ts'
import generateUUID from '../../util/uuid.ts'

export interface MeasurementRequirement {
  readonly snomed_concept_id: string
  readonly is_required: boolean
  readonly clinical_rationale: string
  readonly medical_standard: string
  readonly frequency_recommendation?: string
}

export interface MeasurementRequirementsResult {
  readonly measurements: VitalMeasurementFormInputDefition[]
  readonly applied_requirements: MeasurementRequirement[]
  readonly audit_info: {
    readonly age_based_count: number
    readonly condition_based_count: number
    readonly total_requirements: number
  }
}

/**
 * Determines required measurements for a patient based on age and medical conditions
 * Pure function that combines age-based and condition-based requirements
 */
export async function determineMeasurementsForPatient(
  trx: TrxOrDb,
  {
    age_days,
    active_condition_snomed_codes,
  }: {
    patient_id: string
    age_days: number
    sex: Sex
    active_condition_snomed_codes: readonly string[]
    pregnancy_status?: boolean
  },
): Promise<MeasurementRequirementsResult> {
  const age_requirements = await getAgeMeasurementRequirements(
    trx,
    age_days,
  )

  const condition_requirements = await getConditionMeasurementRequirements(
    trx,
    active_condition_snomed_codes,
  )

  const all_requirements = [...age_requirements, ...condition_requirements]
  const merged_measurements = mergeMeasurementRequirements(all_requirements)

  return {
    measurements: merged_measurements,
    applied_requirements: all_requirements,
    audit_info: {
      age_based_count: age_requirements.length,
      condition_based_count: condition_requirements.length,
      total_requirements: all_requirements.length,
    },
  }
}

async function getAgeMeasurementRequirements(
  trx: TrxOrDb,
  age_days: number,
): Promise<readonly MeasurementRequirement[]> {
  const requirements = await trx
    .selectFrom('age_measurement_requirements')
    .select([
      'required_measurement_snomed_concept_id as snomed_concept_id',
      'is_required',
      'clinical_rationale',
      'medical_standard',
    ])
    .where('active', '=', true)
    .where((eb) =>
      eb.or([
        eb('age_min_days', 'is', null),
        eb('age_min_days', '<=', age_days),
      ])
    )
    .where((eb) =>
      eb.or([
        eb('age_max_days', 'is', null),
        eb('age_max_days', '>=', age_days),
      ])
    )
    .where('effective_date', '<=', new Date())
    .where((eb) =>
      eb.or([
        eb('expiration_date', 'is', null),
        eb('expiration_date', '>', new Date()),
      ])
    )
    .execute()

  return requirements.map((req) => ({
    snomed_concept_id: req.snomed_concept_id.toString(),
    is_required: req.is_required,
    clinical_rationale: req.clinical_rationale,
    medical_standard: req.medical_standard,
  }))
}

async function getConditionMeasurementRequirements(
  trx: TrxOrDb,
  condition_snomed_codes: readonly string[],
): Promise<readonly MeasurementRequirement[]> {
  if (condition_snomed_codes.length === 0) {
    return []
  }

  const requirements = await trx
    .selectFrom('condition_measurement_requirements')
    .select([
      'required_measurement_snomed_concept_id as snomed_concept_id',
      'is_required',
      'clinical_rationale',
      'medical_standard',
      'frequency_recommendation',
    ])
    .where(
      'condition_snomed_concept_id',
      'in',
      condition_snomed_codes.map((code) => code),
    )
    .where('active', '=', true)
    .where('effective_date', '<=', new Date())
    .where((eb) =>
      eb.or([
        eb('expiration_date', 'is', null),
        eb('expiration_date', '>', new Date()),
      ])
    )
    .execute()

  return requirements.map((req) => ({
    snomed_concept_id: req.snomed_concept_id.toString(),
    is_required: req.is_required,
    clinical_rationale: req.clinical_rationale,
    medical_standard: req.medical_standard,
    frequency_recommendation: req.frequency_recommendation || undefined,
  }))
}

function mergeMeasurementRequirements(
  requirements: readonly MeasurementRequirement[],
): VitalMeasurementFormInputDefition[] {
  // Group by SNOMED code to handle duplicates
  const requirements_map = new Map<string, MeasurementRequirement>()

  for (const requirement of requirements) {
    const existing = requirements_map.get(requirement.snomed_concept_id)

    if (!existing) {
      requirements_map.set(requirement.snomed_concept_id, requirement)
    } else {
      const should_replace = (requirement.frequency_recommendation &&
        !existing.frequency_recommendation) ||
        (requirement.medical_standard > existing.medical_standard)

      if (should_replace) {
        requirements_map.set(requirement.snomed_concept_id, requirement)
      }
    }
  }

  return Array.from(requirements_map.values()).map((req) => ({
    finding_id: generateUUID(),
    snomed_concept_id: req.snomed_concept_id,
    required: true as const,
    label: getVitalLabelFromSnomedCode(req.snomed_concept_id),
    units: getVitalUnitsFromSnomedCode(req.snomed_concept_id),
  }))
}

function getVitalLabelFromSnomedCode(snomed_concept_id: string): string {
  const label_map: Record<string, string> = {
    [VITALS_SNOMED_CODE.temperature]: 'temperature',
    [VITALS_SNOMED_CODE.heart_rate]: 'heart_rate',
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

function getVitalUnitsFromSnomedCode(snomed_concept_id: string): string {
  const units_map: Record<string, string> = {
    [VITALS_SNOMED_CODE.temperature]: VITALS_UNITS.temperature,
    [VITALS_SNOMED_CODE.heart_rate]: VITALS_UNITS.heart_rate,
    [VITALS_SNOMED_CODE.respiratory_rate]: VITALS_UNITS.respiratory_rate,
    [VITALS_SNOMED_CODE.height]: VITALS_UNITS.height,
    [VITALS_SNOMED_CODE.weight]: VITALS_UNITS.weight,
    [VITALS_SNOMED_CODE.blood_pressure_systolic]:
      VITALS_UNITS.blood_pressure_systolic,
    [VITALS_SNOMED_CODE.blood_pressure_diastolic]:
      VITALS_UNITS.blood_pressure_diastolic,
    [VITALS_SNOMED_CODE.blood_oxygen_saturation]:
      VITALS_UNITS.blood_oxygen_saturation,
    [VITALS_SNOMED_CODE.blood_glucose]: VITALS_UNITS.blood_glucose,
    [VITALS_SNOMED_CODE.head_circumference]: VITALS_UNITS.head_circumference,
    [VITALS_SNOMED_CODE.midarm_circumference]:
      VITALS_UNITS.midarm_circumference,
    [VITALS_SNOMED_CODE.triceps_skinfold]: VITALS_UNITS.triceps_skinfold,
  }

  return units_map[snomed_concept_id] || 'unit'
}
