import { assert } from 'std/assert/assert.ts'
import { useSteps } from '../../../components/library/Steps.tsx'

export type AddPatientStep =
  | 'personal'
  | 'address'
  | 'pre-existing_conditions'
  | 'history'
  | 'occupation'
  | 'family'
  | 'lifestyle'
  | 'review'

const stepNames: AddPatientStep[] = [
  'personal',
  'address',
  'pre-existing_conditions',
  'history',
  'occupation',
  'family',
  'lifestyle',
  'review',
]

export function isStep(step: string | null): step is AddPatientStep {
  return stepNames.includes(step as AddPatientStep)
}

export function getNextStep(currentStep: AddPatientStep): AddPatientStep {
  const currentIndex = stepNames.indexOf(currentStep)
  assert(currentIndex !== -1, `Invalid step: ${currentStep}`)
  assert(
    currentIndex < stepNames.length - 1,
    `No next step for: ${currentStep}`,
  )
  const nextIndex = currentIndex + 1
  return stepNames[nextIndex]
}

export const useAddPatientSteps = useSteps(stepNames)
