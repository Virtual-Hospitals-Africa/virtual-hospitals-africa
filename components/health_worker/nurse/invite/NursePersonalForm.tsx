import FormRow from '../../../library/FormRow.tsx'
import Buttons from '../../../../islands/form/buttons.tsx'
import { FormState } from '../../../../routes/app/organizations/[organization_id]/register/[step].tsx'
import { NationalIdInput } from '../../../../islands/NationalId.tsx'
import AddressSection from '../../../patient-registration/AddressSection.tsx'
import { DateInput } from '../../../../islands/form/inputs/date.tsx'
import { PhoneNumberInput } from '../../../../islands/form/inputs/phone_number.tsx'
import { TextInput } from '../../../../islands/form/inputs/text.tsx'

export default function NursePersonalForm(
  { form_data }: {
    form_data: Partial<FormState>
  },
) {
  return (
    <>
      <FormRow>
        <TextInput
          name='first_name'
          required
          label='First Name'
          value={form_data.first_name}
        />
        <TextInput
          name='middle_names'
          label='Middle Names'
          value={form_data.middle_names}
        />
        <TextInput
          name='last_name'
          required
          label='Last Name'
          value={form_data.last_name}
        />
      </FormRow>
      <FormRow>
        <DateInput
          name='date_of_birth'
          required
          label='Date of Birth'
          value={form_data.date_of_birth}
        />
        {/* <GenderSelect value={form_data.gender} /> */}
      </FormRow>
      <FormRow>
        <NationalIdInput value={form_data.national_id_number} />
      </FormRow>
      <FormRow>
        <TextInput
          name='email'
          type='email'
          required
          label='Email'
          value={form_data.email}
          disabled
        />
        <PhoneNumberInput
          name='mobile_number'
          required
          label='Mobile Phone Number'
          value={form_data.mobile_number}
        />
      </FormRow>
      <hr className='my-2' />
      <AddressSection
        address={form_data.address || {}}
      />
      <hr className='my-2' />
      <Buttons submitText='Next' />
    </>
  )
}
