import { Select, TextInput } from '../../library/form/Inputs.tsx'
import FormRow from '../../library/form/Row.tsx'
import SectionHeader from '../../library/typography/SectionHeader.tsx'
import ReligionSelect from '../../../islands/ReligionSelect.tsx'
import { OnboardingPatient, PatientFamily } from '../../../types.ts'
import PatientFamilyForm from '../../../islands/family/Form.tsx'

export default function FamilyForm(
  { patient = {}, family }: {
    patient?: Partial<OnboardingPatient>
    family: PatientFamily
  },
) 
{
  const age = new Date(patient.date_of_birth!)
  return (
    <>
      {
        /* <FormRow>
        <Select
          name='marital_status'
          required
          label='Marital Status'
        >
          <option value=''>Select</option>
          <option value='single'>Single</option>
          <option value='married'>Married</option>
          <option value='civil_partner'>Civil Partner</option>
          <option value='widow_widower'>Widow/Widower</option>
          <option value='separated'>Separated</option>
          <option value='divorced'>Divorced</option>
        </Select>
        <ReligionSelect />
      </FormRow> */
      }
      <section>
        <PatientFamilyForm family={family} age={12} />
      </section>
    </>
  )
}
