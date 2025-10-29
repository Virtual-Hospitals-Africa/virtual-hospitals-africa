import FormRow from '../../../library/FormRow.tsx'
import Buttons from '../../../../islands/form/buttons.tsx'
import { FormState } from '../../../../routes/app/organizations/[organization_id]/register/[step].tsx'
import { ZimbabweanNationalIdInput } from '../../../../islands/ZimbabweanNationalId.tsx'
import AddressSection from '../../../patient-registration/AddressSection.tsx'
import { DateInput } from '../../../../islands/form/inputs/date.tsx'
import { PhoneNumberInput } from '../../../../islands/form/inputs/phone_number.tsx'
import { TextInput } from '../../../../islands/form/inputs/text.tsx'
import { SexAndGenderInputs } from '../../../../islands/patient-registration/SexAndGenderInputs.tsx'
import { NamesFormRow } from '../../../../islands/patient-registration/NamesFormRow.tsx'

export default function NursePersonalForm(
  { form_data }: {
    form_data: Partial<FormState>
  },
) {
  return (
    <>
      <NamesFormRow
        names={form_data}
      />
      <FormRow>
        <DateInput
          name='date_of_birth'
          required
          label='Date of Birth'
          value={form_data.date_of_birth}
        />
        {/* <GenderSelect value={form_data.gender} /> */}
        <SexAndGenderInputs sex={form_data.sex} gender={form_data.gender} />
      </FormRow>
      <FormRow>
        <ZimbabweanNationalIdInput value={form_data.national_id_number} />
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
