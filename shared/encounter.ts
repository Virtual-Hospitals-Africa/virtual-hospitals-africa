import { EncounterReason, EncounterStep } from '../db.d.ts'

export const ENCOUNTER_STEPS: EncounterStep[] = [
  'vitals',
  'symptoms',
  'head_to_toe_assessment',
  'examinations',
  'diagnostic_tests',
  'diagnoses',
  'prescriptions',
  'orders',
  'clinical_notes',
  'referral',
  'close_visit',
]

export function isEncounterStep(value: unknown): value is EncounterStep {
  return ENCOUNTER_STEPS.includes(value as EncounterStep)
}

export const ENCOUNTER_REASONS = new Set<EncounterReason>([
  'seeking treatment',
  'maternity',
  'appointment',
  'follow up',
  'referral',
  'checkup',
  'emergency',
  'other',
])
