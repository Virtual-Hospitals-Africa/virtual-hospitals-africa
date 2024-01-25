import { IntakeStep } from '../db.d.ts'

export const INTAKE_STEPS: IntakeStep[] = [
  'personal',
  'address',
  'conditions',
  'history',
  'occupation',
  'family',
  'lifestyle',
  'review',
]

export function isIntakeStep(value: unknown): value is IntakeStep {
  return INTAKE_STEPS.includes(value as IntakeStep)
}
