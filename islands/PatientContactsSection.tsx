import { useSignal } from '@preact/signals'
import FormSection from '../components/library/FormSection.tsx'
import CountrySelect from './CountrySelect.tsx'
import { Address } from '../types.ts'
import { PhoneNumberInput } from './form/inputs/phone_number.tsx'
import FormGrid from '../components/library/FormGrid.tsx'
import AsyncSearch from './AsyncSearch.tsx'
import { OptionLike } from './Search.tsx'

type AddressSuggestion = OptionLike & {
  main_text: string
  description: string
}

export default function PatientContactInformationSection(
  { address, default_country, phone_number, organization_id }: { address?: Address; default_country: string; phone_number?: string; organization_id?: string },
) {
  const country = useSignal(address?.country || default_country)

  return (
    <FormSection header='Patient Contact Information'>
      <FormGrid columns={2}>
        <CountrySelect
          name='country'
          label='Country'
          required
          value={country.value || 'ZA'}
          onChange={(event) => country.value = event.currentTarget.value}
        />

        <PhoneNumberInput
          name='phone_number'
          label='Phone Number'
          value={phone_number}
        />
      </FormGrid>

      <div class='mt-4'>
        <AsyncSearch<AddressSuggestion>
          search_route={`/app/organizations/${organization_id}/google_maps_responses?country=${country.value || default_country}`}
          skip_blank_search
          placeholder='Start typing an address...'
          label='Address'
          required
          name='google_maps_place'
          value={address?.google_maps_place_id && address?.formatted
            ? {
              id: address?.google_maps_place_id,
              name: address?.formatted,
              main_text: address?.formatted,
              description: address?.formatted,
            }
            : undefined}
          Option={({ option, active }) => (
            <div class='py-1'>
              <div class={active ? 'font-medium' : 'font-normal'}>
                {option.main_text}
              </div>
              <div class='text-sm text-gray-500'>
                {option.description}
              </div>
            </div>
          )}
        />
      </div>
    </FormSection>
  )
}
