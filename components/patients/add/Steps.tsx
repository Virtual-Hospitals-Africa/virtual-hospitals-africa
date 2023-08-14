import { PageProps } from '$fresh/server.ts'
import { Steps } from '../../../components/library/Steps.tsx'

export type AddPatientStep =
  | 'personal'
  | 'address'
  | 'pre-existing_conditions'
  | 'history'
  | 'age_related_questions'

const stepNames: AddPatientStep[] = [
  'personal',
  'address',
  'pre-existing_conditions',
  'history',
  'age_related_questions',
]

export function getNextStep(currentStep: AddPatientStep): AddPatientStep {
  const currentIndex = stepNames.indexOf(currentStep)
  const nextIndex = currentIndex + 1
  return nextIndex === stepNames.length ? currentStep : stepNames[nextIndex]
}

// deno-lint-ignore no-explicit-any
function isAddPatientStep(step: any): step is AddPatientStep {
  return stepNames.includes(step)
}

export function useAddPatientSteps(props: PageProps) {
  const stepQuery = props.url.searchParams.get('step')
  const currentStep = isAddPatientStep(stepQuery) ? stepQuery : stepNames[0]

  let completed = false

  const steps = stepNames.map((name) => {
    if (name === currentStep) {
      completed = true
      return { name, status: 'current' as const }
    }
    if (completed) {
      return { name, status: 'upcoming' as const }
    }
    return { name, status: 'complete' as const }
  })

  return {
    currentStep,
    steps: <Steps url={props.url} steps={steps} />,
  }
}
