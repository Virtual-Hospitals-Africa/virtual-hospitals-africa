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

export default function NursePersonalForm(
  { formData }: { formData: FormState },
) {
  return (
    <>
      <FormRow>
        <TextInput
          name='first_name'
          required
          label='First Name'
        />
        <TextInput
          name='middle_names'
          label='Middle Names'
        />
        <TextInput
          name='last_name'
          required
          label='Last Name'
        />
      </FormRow>
      <FormRow>
        <DateInput
          name='date_of_birth'
          required
          label='Date of Birth'
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
