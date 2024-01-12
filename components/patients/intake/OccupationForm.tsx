import { PatientAge } from '../../../db.d.ts'
import Occupation0_18 from '../../../islands/Occupation0-18.tsx'
import Occupation19 from '../../../islands/Occupation19.tsx'
import { Occupation, OnboardingPatient } from '../../../types.ts'

function isPatientUnder19(patientAge: PatientAge): boolean {
  if (patientAge.age_number == null) {
    return false
  }
  return patientAge.age_unit !== 'year' ||
    (patientAge.age_unit === 'year' && patientAge.age_number < 19)
}

export default function PatientOccupationForm(
  { patient = {}, patientAge, occupation }: {
    patient?: Partial<OnboardingPatient>
    patientAge: PatientAge
    occupation: Occupation | undefined
  },
) {
  return (
    <>
      {isPatientUnder19(patientAge)
        ? (
          <Occupation0_18
            occupation={occupation}
          />
        )
        : <Occupation19 />}
    </>
  )
}
