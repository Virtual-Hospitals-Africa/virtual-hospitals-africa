import { EncounterStep } from '../db.d.ts'
import { PatientEncounterReason } from '../types.ts'

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

export const reasons = new Set<PatientEncounterReason>([
  'seeking treatment',
  'appointment',
  'follow up',
  'referral',
  'checkup',
  'emergency',
  'other',
])
