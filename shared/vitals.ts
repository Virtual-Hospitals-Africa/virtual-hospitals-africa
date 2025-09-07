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
  midarm_circumference: '---', //284473002 | Mid upper arm circumference , left arm: 1162540006, right arm: 1162545001
  triceps_skinfold: '---', //301851003 | Triceps skin fold thickness
  // Computed vitals
  bmi: '698094009',
  mean_arterial_pressure: '6797001',
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
  bmi: 'kg/m²',
  mean_arterial_pressure: 'mmHg',
}
