import { useSteps } from '../../../components/library/Steps.tsx'

export type AddPatientStep =
  | 'personal'
  | 'address'
  | 'pre-existing_conditions'
  | 'history'
  | 'occupation'
  | 'family'
  | 'lifestyle'

const stepNames: AddPatientStep[] = [
  'personal',
  'address',
  'pre-existing_conditions',
  'history',
  'occupation',
  'family',
  'lifestyle',
]

export function getNextStep(currentStep: AddPatientStep): AddPatientStep {
  const currentIndex = stepNames.indexOf(currentStep)
  const nextIndex = currentIndex + 1
  return nextIndex === stepNames.length ? currentStep : stepNames[nextIndex]
}

export const useAddPatientSteps = useSteps(stepNames)
