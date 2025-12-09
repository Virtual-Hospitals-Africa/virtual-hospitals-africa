import FormRow from '../components/library/FormRow.tsx'
import FormSection from '../components/library/FormSection.tsx'
import CountrySelect from './CountrySelect.tsx'
import { PhoneNumberInput, TextInput } from './form/Inputs.tsx'
import { Address } from '../types.ts'

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