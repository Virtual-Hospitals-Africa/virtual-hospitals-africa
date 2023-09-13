import { useSteps } from '../../../components/library/Steps.tsx'

export type AddPatientStep =
  | 'personal'
  | 'address'
  | 'pre-existing_conditions'
  | 'family'
  | 'age_related_questions'

const stepNames: AddPatientStep[] = [
  'personal',
  'address',
  'pre-existing_conditions',
  'family',
  'age_related_questions',
]

export function getNextStep(currentStep: AddPatientStep): AddPatientStep {
  const currentIndex = stepNames.indexOf(currentStep)
  const nextIndex = currentIndex + 1
  return nextIndex === stepNames.length ? currentStep : stepNames[nextIndex]
}

export const useAddPatientSteps = useSteps(stepNames)
