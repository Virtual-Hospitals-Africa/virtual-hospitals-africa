import AllergySearch from '../../../islands/AllergySearch.tsx'
import ConditionSearch from '../../../islands/ConditionSearch.tsx'
import { OnboardingPatient } from '../../../types.ts'
import Occupation0_18 from '../../../islands/Occupation0-18.tsx'
import FormRow from '../../library/form/Row.tsx'
import { TextInput } from '../../library/form/Inputs.tsx'
export default function PatientOccupationForm(
  { patient = {} }: { patient?: Partial<OnboardingPatient> },
) {
  return <Occupation0_18 />
}
