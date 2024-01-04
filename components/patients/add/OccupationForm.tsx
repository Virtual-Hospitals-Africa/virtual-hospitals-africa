import { OnboardingPatient, PatientOccupation } from '../../../types.ts'
import Occupation0_18 from '../../../islands/Occupation0-18.tsx'

export default function PatientOccupationForm(
  { patient = {} }: { 
    patient?: Partial<OnboardingPatient> },
    occupation: PatientOccupation
) {
  //Or determine Patients age here
  return <Occupation0_18 occupation={occupation}/>
}
