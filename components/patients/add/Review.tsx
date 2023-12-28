// deno-lint-ignore-file no-explicit-any
import { OnboardingPatient } from '../../../types.ts'
import PatientDetailedCard from '../DetailedCard.tsx'

export default function PatientReview(
  { patient }: {
    patient: OnboardingPatient
  },
) {
  return (
    <div>
      <PatientDetailedCard patient={patient as any} />
      <input type='hidden' name='completed_onboarding' value='on' />
    </div>
  )
}
