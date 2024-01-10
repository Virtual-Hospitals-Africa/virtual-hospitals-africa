import Occupation0_18 from '../../../islands/Occupation0-18.tsx'
import Occupation19 from '../../../islands/Occupation19.tsx'
import { OnboardingPatient, PatientAge } from '../../../types.ts'

function under19(patientAge: PatientAge): boolean {
  if (patientAge.age_number == null) {
    return false
  }
  return patientAge.age_unit != 'year' ||
    (patientAge.age_unit === 'year' && patientAge.age_number < 19)
}

export default function PatientOccupationForm(
  { patient = {}, patientAge }: {
    patient?: Partial<OnboardingPatient>
    patientAge: PatientAge
  },
) {
  return (
    <>
      {under19(patientAge) ? <Occupation0_18 /> : <Occupation19 />}
    </>
  )
}
