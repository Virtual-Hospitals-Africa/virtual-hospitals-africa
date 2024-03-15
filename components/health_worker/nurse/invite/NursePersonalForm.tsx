import {
  DateInput,
  GenderSelect,
  PhoneNumberInput,
  TextInput,
} from '../../../../islands/form/Inputs.tsx'
import FormRow from '../../../../islands/form/Row.tsx'
import Buttons from '../../../../islands/form/buttons.tsx'
import { FormState } from '../../../../routes/app/facilities/[facility_id]/register/[step].tsx'
import NationalIdInput from '../../../../islands/NationalIdInput.tsx'
import { CountryAddressTree } from '../../../../types.ts'
import AddressForm from '../../../../islands/address-inputs.tsx'

export default function NursePersonalForm(
  { formData, country_address_tree }: {
    formData: Partial<FormState>
    country_address_tree: CountryAddressTree
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
      <AddressForm
        address={formData.address || {}}
        country_address_tree={country_address_tree}
      />
      <hr className='my-2' />
      <Buttons submitText='Next' />
    </>
  )
}
