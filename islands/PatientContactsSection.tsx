import FormSection from '../components/library/FormSection.tsx'
import CountrySelect from './CountrySelect.tsx'
import { Address } from '../types.ts'
import { PhoneNumberInput } from './form/inputs/phone_number.tsx'
import { TextInput } from './form/inputs/text.tsx'
import FormGrid from '../components/library/FormGrid.tsx'

export default function PatientContactInformationSection(
  { address }: { address?: Address },
) {
  return (
    <FormSection header='Patient Contact Information'>
      <FormGrid columns={2}>
        <CountrySelect
          name='country'
          label='Country'
          required
          defaultValue='South Africa'
          value={address?.country}
        >
        </CountrySelect>
        <PhoneNumberInput
          name='phone_number'
          label='Phone Number'
          required
        >
        </PhoneNumberInput>
        <TextInput
          name='address'
          label='Street Address'
          required
          value={address?.street}
        >
        </TextInput>
      </FormGrid>
    </FormSection>
  )
}
