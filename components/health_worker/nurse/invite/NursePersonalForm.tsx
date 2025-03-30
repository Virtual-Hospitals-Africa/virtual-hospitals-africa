import {
  DateInput,
  GenderSelect,
  PhoneNumberInput,
  TextInput,
} from '../../../../islands/form/Inputs.tsx'
import FormRow from '../../../library/FormRow.tsx'
import Buttons from '../../../../islands/form/buttons.tsx'
import { FormState } from '../../../../routes/app/organizations/[organization_id]/register/[step].tsx'
import { NationalIdInput } from '../../../../islands/NationalId.tsx'
import AddressSection from '../../../patient-intake/AddressSection.tsx'

export default function NursePersonalForm(
  { formData }: {
    formData: Partial<FormState>
  },
) {
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
      <AddressSection
        address={formData.address || {}}
      />
      <hr className='my-2' />
      <Buttons submitText='Next' />
    </>
  )
}
