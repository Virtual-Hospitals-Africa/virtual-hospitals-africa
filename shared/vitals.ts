export const TAKING_PATIENT_VITAL_SIGNS_SNOMED_CODE = '61746007'

export const VITALS_SNOMED_CODE = {
  height: '1153637007',
  weight: '363808001',
  temperature: '722490005',
  blood_pressure_systolic: '271649006',
  blood_pressure_diastolic: '271650006',
  blood_oxygen_saturation: '103228002',
  blood_glucose: '405176005',
  pulse: '8499008',
  respiratory_rate: '86290005',
  midarm_circumference: '284473002',
  triceps_skinfold: '301851003',
  // Computed vitals
  body_mass_index: '698094009',
  mean_arterial_pressure: '6797001',
  blood_pressure: '75367002',
  // Triage assessments
  avpu_consciousness: '1104441000000107',
  mobility_assessment: '301438001',
  trauma_presence: '417746004',
}

export const VITALS_UNITS = {
  height: 'cm',
  weight: 'kg',
  temperature: '°C',
  blood_pressure_systolic: 'mmHg',
  blood_pressure_diastolic: 'mmHg',
  blood_oxygen_saturation: '%',
  blood_glucose: 'mg/dL',
  pulse: 'bpm',
  respiratory_rate: 'bpm',
  midarm_circumference: 'cm',
  triceps_skinfold: 'cm',
  // Computed vitals
  body_mass_index: 'kg/m²',
  mean_arterial_pressure: 'mmHg',
  avpu_consciousness: 'score',
  mobility_assessment: 'score',
  trauma_presence: 'score',
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
