import { DateInput, NurseSpecialtySelect, TextInput } from '../../../library/form/Inputs.tsx'

import FormRow from '../../../library/form/Row.tsx'
import Buttons from '../../../library/form/buttons.tsx'

import { FormState } from '../../../../routes/app/facilities/[facilityId]/register.tsx'
import unsavedChangesWarning from '../../../library/form/unsaved_changes_warning.tsx'

export default function NurseProfessionalForm(
  { formData }: { formData: FormState },
) {
  // unsavedChangesWarning()

  return (
    <>
      <FormRow>
        <DateInput
          name='date_of_first_practice'
          required
          label='Date of First Practice'
          value={formData.date_of_first_practice}
        />
        <TextInput
          name='ncz_registration_number'
          required
          placeholder='GN123456'
          pattern='^[a-zA-Z]{2}[0-9]{6}$'
          label='Nurses Council of Zimbabwe Registration Number'
          value={formData.ncz_registration_number}
        />
      </FormRow>
      <FormRow>
        <NurseSpecialtySelect value={formData.specialty}/>
      </FormRow>
      <hr className='my-2' />
      <Buttons
        submitText='Next'
        cancelText='Back'
      />
    </>
  )
}