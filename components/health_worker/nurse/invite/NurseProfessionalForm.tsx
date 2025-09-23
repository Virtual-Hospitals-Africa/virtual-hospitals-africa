import {
  DateInput,
  NurseSpecialtySelect,
  TextInput,
} from '../../../../islands/form/Inputs.tsx'
import FormRow from '../../../library/FormRow.tsx'
import Buttons from '../../../../islands/form/buttons.tsx'
import { FormState } from '../../../../routes/app/organizations/[organization_id]/register/[step].tsx'

export default function NurseProfessionalForm(
  { form_data }: { form_data: Partial<FormState> },
) {
  return (
    <>
      <FormRow>
        <DateInput
          name='date_of_first_practice'
          required
          label='Date of First Practice'
          value={form_data.date_of_first_practice}
        />
        <TextInput
          name='ncz_registration_number'
          required
          placeholder='GN123456'
          pattern='^[a-zA-Z]{2}[0-9]{6}$'
          label='Nurses Council of Zimbabwe Registration Number'
          value={form_data.ncz_registration_number}
        />
      </FormRow>
      <FormRow>
        <NurseSpecialtySelect value={form_data.specialty} />
      </FormRow>
      <hr className='my-2' />
      <Buttons submitText='Next' />
    </>
  )
}
