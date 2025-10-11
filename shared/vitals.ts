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
  head_circumference: '363812007',
  midarm_circumference: '284473002', // Mid upper arm circumference
  triceps_skinfold: '301851003', // Triceps skin fold thickness
  // Computed vitals
  body_mass_index: '698094009',
  mean_arterial_pressure: '6797001',
  blood_pressure: '75367002',
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
  head_circumference: 'cm',
  midarm_circumference: 'cm',
  triceps_skinfold: 'cm',
  // Computed vitals
  body_mass_index: 'kg/m²',
  mean_arterial_pressure: 'mmHg',
}

export const CM_TO_METERS = 100
export const BMI_DECIMAL_PLACES = 1

export function computeBMI(height_cm: number, weight_kg: number): number {
  if (height_cm <= 0 || weight_kg <= 0) {
    throw new Error('Height and weight must be positive')
  }
  const height_m = height_cm / CM_TO_METERS
  return weight_kg / (height_m * height_m)
}

export function computeMeanArterialPressure(
  systolic: number,
  diastolic: number,
): number {
  if (systolic <= 0 || diastolic <= 0) {
    throw new Error('Blood pressure values must be positive')
  }
  return diastolic + (systolic - diastolic) / 3
}

export function formatBloodPressureDisplay(
  systolic: number,
  diastolic: number,
): string {
  return `${systolic}/${diastolic} mmHg`
}
