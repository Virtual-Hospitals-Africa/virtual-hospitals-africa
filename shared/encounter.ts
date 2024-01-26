import { EncounterStep } from '../db.d.ts'

export const ENCOUNTER_STEPS: EncounterStep[] = [
  'vitals',
  'symptoms',
  'examinations',
  'diagnostic_tests',
  'diagnosis',
  'prescriptions',
  'orders',
  'clinical_notes',
  'referral',
  'close_visit',
]

export function isEncounterStep(value: unknown): value is EncounterStep {
  return ENCOUNTER_STEPS.includes(value as EncounterStep)
}
