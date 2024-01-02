import { assert } from 'std/assert/assert.ts'
import { useSteps } from '../../library/Steps.tsx'

export type IntakePatientStep =
  | 'personal'
  | 'address'
  | 'pre-existing_conditions'
  | 'history'
  | 'occupation'
  | 'family'
  | 'lifestyle'
  | 'review'

const stepNames: IntakePatientStep[] = [
  'personal',
  'address',
  'pre-existing_conditions',
  'history',
  'occupation',
  'family',
  'lifestyle',
  'review',
]

export function isStep(step: string | null): step is IntakePatientStep {
  return stepNames.includes(step as IntakePatientStep)
}

export function getNextStep(currentStep: IntakePatientStep): IntakePatientStep {
  const currentIndex = stepNames.indexOf(currentStep)
  assert(currentIndex !== -1, `Invalid step: ${currentStep}`)
  assert(
    currentIndex < stepNames.length - 1,
    `No next step for: ${currentStep}`,
  )
  const nextIndex = currentIndex + 1
  return stepNames[nextIndex]
}

export const useIntakePatientSteps = useSteps(stepNames)
