import entries from '../util/entries.ts'
import memoize from '../util/memoize.ts'

export const TAKING_PATIENT_VITAL_SIGNS_SNOMED_CODE = '61746007'

export const VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS = {
  height: '1153637007',
  weight: '363808001',
  temperature: '386725007',
  blood_pressure_systolic: '271649006',
  blood_pressure_diastolic: '271650006',
  blood_oxygen_saturation: '103228002',
  blood_glucose: '405176005',
  heart_rate: '8499008',
  respiratory_rate: '86290005',
  midarm_circumference: '284473002',
  triceps_skinfold: '301851003',
  head_circumference: '363812007',
}

export const VITALS_COMPUTED_SNOMED_CONCEPT_IDS = {
  body_mass_index: '698094009',
  mean_arterial_pressure: '6797001',
  blood_pressure: '75367002',
}
// // Computed vitals

export const vitalMeasurementFromSnomedConceptId = memoize(
  (snomed_concept_id: string) => {
    for (
      const [vital, concept_id] of entries(
        VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS,
      )
    ) {
      if (concept_id === snomed_concept_id) {
        return vital
      }
    }
    throw new Error(
      `No vital found for snomed_concept_id: ${snomed_concept_id}`,
    )
  },
)

// Triage assessments
export const VITAL_ASSESSMENTS_SNOMED_CONCEPT_IDS = {
  consciousness: '1104441000000107',
  mobility_assessment: '301438001',
  trauma_presence: '417746004',
}

export type ComputedVital = keyof typeof VITALS_COMPUTED_SNOMED_CONCEPT_IDS
export type VitalMeasurement =
  keyof typeof VITAL_MEASUREMENTS_SNOMED_CONCEPT_IDS
export type VitalAssessment = keyof typeof VITAL_ASSESSMENTS_SNOMED_CONCEPT_IDS
export type Vital = VitalMeasurement | VitalAssessment

export const ADULT_TEWS_COMPONENTS = [
  'mobility_assessment' as const,
  'respiratory_rate' as const,
  'heart_rate' as const,
  'blood_pressure_systolic' as const,
  'temperature' as const,
  'consciousness' as const,
  'trauma_presence' as const,
] satisfies Vital[]

export type AdultTEWSComponent = (typeof ADULT_TEWS_COMPONENTS)[number]

export const vitalAssessmentFromSnomedConceptId = memoize(
  (snomed_concept_id: string) => {
    for (
      const [vital, concept_id] of entries(VITAL_ASSESSMENTS_SNOMED_CONCEPT_IDS)
    ) {
      if (concept_id === snomed_concept_id) {
        return vital
      }
    }
    throw new Error(
      `No vital found for snomed_concept_id: ${snomed_concept_id}`,
    )
  },
)

export const VITAL_MEASUREMENTS_UNITS = {
  height: 'cm',
  weight: 'kg',
  temperature: '°C',
  blood_pressure_systolic: 'mmHg',
  blood_pressure_diastolic: 'mmHg',
  blood_oxygen_saturation: '%',
  blood_glucose: 'mg/dL',
  heart_rate: 'bpm',
  respiratory_rate: 'bpm',
  midarm_circumference: 'cm',
  head_circumference: 'cm',
  triceps_skinfold: 'cm',
} satisfies {
  [v in VitalMeasurement]: string
}

// // Computed vitals
export const VITAL_COMPUTED_UNITS = {
  body_mass_index: 'kg/m²',
  mean_arterial_pressure: 'mmHg',
} satisfies {
  [v in ComputedVital]?: string
}

/**
 * Extracts active condition SNOMED codes from patient history context.
 *
 * TODO: When patient_history.pre_existing_conditions schema is properly implemented
 * with condition objects containing snomed_concept_id fields, update this function
 */
export function getActiveConditionsSnomedCodesFromContext(
  patient_history: { pre_existing_conditions: readonly unknown[] },
): readonly string[] {
  return patient_history.pre_existing_conditions as readonly string[]
}

export const CM_TO_METERS = 100
export const BMI_DECIMAL_PLACES = 1

export function computeBMI(height_cm: number, weight_kg: number): number {
  if (height_cm <= 0 || weight_kg <= 0) {
    return 0
  }
  const height_m = height_cm / CM_TO_METERS
  return weight_kg / (height_m * height_m)
}

export function computeMeanArterialPressure(
  systolic: number,
  diastolic: number,
): number {
  return diastolic + (systolic - diastolic) / 3
}

export function formatBloodPressureDisplay(
  systolic: number,
  diastolic: number,
): string {
  return `${systolic}/${diastolic}`
}
