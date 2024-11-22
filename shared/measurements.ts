import { Measurements } from '../types.ts'

export const MEASUREMENTS: {
  [Name in keyof Measurements]: Measurements[Name][2]
} = {
  height: 'cm',
  weight: 'kg',
  temperature: 'celsius',
  blood_pressure_diastolic: 'mmHg',
  blood_pressure_systolic: 'mmHg',
  blood_oxygen_saturation: '%',
  blood_glucose: 'mg/dL',
  pulse: 'bpm',
  respiratory_rate: 'bpm',
  midarm_circumference: 'cm',
  triceps_skinfold: 'cm',
}
