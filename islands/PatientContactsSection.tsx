import FormRow from '../components/library/FormRow.tsx'
import FormSection from '../components/library/FormSection.tsx'
import CountrySelect from './CountrySelect.tsx'
import { Address } from '../types.ts'
import { PhoneNumberInput } from './form/inputs/phone_number.tsx'
import { TextInput } from './form/inputs/text.tsx'

export default function PatientContactInformationSection( {address}: {address?: Address}) {
  return (
    <FormSection header="Patient Contact Information">
      <FormRow >
        <CountrySelect
          name="country"
          label="Country"
          required
          defaultValue="South Africa"
          value={address?.country}
        >
        </CountrySelect>
        <PhoneNumberInput
          name="phone_number"
          label="Phone Number"
          required
        >
        </PhoneNumberInput>
      </FormRow>
      <FormRow >
        <TextInput
          name="address"
          label="Street Address"
          required
          value={address?.street}
        >
        </TextInput>
      </FormRow>
    </FormSection>
  );
}