import {
  DateInput,
  GenderSelect,
  NationalIdInput,
  PhoneNumberInput,
  TextInput,
} from '../../../library/form/Inputs.tsx'
import FormRow from '../../../library/form/Row.tsx'
import Buttons from '../../../library/form/buttons.tsx'
import { FormState } from '../../../../routes/app/facilities/[facilityId]/register.tsx'
import unsavedChangesWarning from '../../../library/form/unsaved_changes_warning.tsx'

export default function NursePersonalForm(
  { formData }: { formData: FormState },
) {

  unsavedChangesWarning();

  return (
    <>
      <FormRow>
        <TextInput
          name='first_name'
          required
          label='First Name'
          value={formData.first_name}
        />
        <TextInput
          name='middle_names'
          label='Middle Names'
          value={formData.middle_names}
        />
        <TextInput
          name='last_name'
          required
          label='Last Name'
          value={formData.last_name}
        />
      </FormRow>
      <FormRow>
        <DateInput
          name='date_of_birth'
          required
          label='Date of Birth'
          value={formData.date_of_birth}
        />
        <GenderSelect value={formData.gender} />
      </FormRow>
      <FormRow>
        <NationalIdInput value={formData.national_id_number} />
      </FormRow>
      <FormRow>
        <TextInput
          name='email'
          type='email'
          required
          label='Email'
          value={formData.email}
          disabled
        />
        <PhoneNumberInput
          name='mobile_number'
          required
          label='Mobile Phone Number'
          value={formData.mobile_number}
        />
      </FormRow>
      <hr className='my-2' />
      <Buttons
        submitText='Next'
        cancelText='Back'
      />
    </>
  )
}
