import { EncounterReason, EncounterStep } from '../db.d.ts'

export const ENCOUNTER_STEPS: EncounterStep[] = [
  'vitals',
  'symptoms',
  'history',
  'general_assessments',
  'examinations',
  'diagnostic_tests',
  'diagnoses',
  'prescriptions',
  'orders',
  'clinical_notes',
  'request_review',
  'close_visit',
]

export function isEncounterStep(value: unknown): value is EncounterStep {
  return ENCOUNTER_STEPS.includes(value as EncounterStep)
}

export const ENCOUNTER_REASONS: EncounterReason[] = [
  'seeking treatment',
  'maternity',
  'appointment',
  'follow up',
  'referral',
  'checkup',
  'emergency',
  'other',
]
