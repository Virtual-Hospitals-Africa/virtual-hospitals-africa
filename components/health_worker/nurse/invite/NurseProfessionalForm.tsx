import FormRow from '../../../library/FormRow.tsx'
import Buttons from '../../../../islands/form/buttons.tsx'
import { FormState } from '../../../../routes/app/organizations/[organization_id]/register/[step].tsx'
import { DateInput } from '../../../../islands/form/inputs/date.tsx'
import { TextInput } from '../../../../islands/form/inputs/text.tsx'
import { NURSE_SPECIALTIES } from '../../../../types.ts'
import { SpecialtySelectWithKnownOptions } from '../../../../islands/SpecialtySelect.tsx'

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
        <SpecialtySelectWithKnownOptions
          specialty={form_data.specialty ?? null}
          options={NURSE_SPECIALTIES}
        />
      </FormRow>
      <hr className='my-2' />
      <Buttons submitText='Next' />
    </>
  )
}
