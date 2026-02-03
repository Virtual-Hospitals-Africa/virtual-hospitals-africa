import { useMemo } from 'preact/hooks'
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
  secondary_text: string
}

function formatAddress(street?: string, locality?: string, country?: string) {
  return [street, locality, country].filter(Boolean).join(', ')
}

async function fetchPlaceDetails(place_id: string): Promise<Address | null> {
  try {
    const url = new URL(`${globalThis.location.origin}/app/organizations/${organization_id}/google_maps_responses`)
    url.search = ''
    url.searchParams.set('place_id', place_id)

    const response = await fetch(url.toString(), {
      headers: {
        'Accept': 'application/json',
      },
    })

    if (!response.ok) {
      console.error('Failed to fetch place details:', response.status)
      return null
    }

    const details = await response.json()
    console.log('Fetched place details:', details)

    if (!details) return null

    const street = (details.route || details.street_number) ? `${details.street_number || ''} ${details.route || ''}`.trim() : ''

    return {
      formatted: formatAddress(street, details.locality, details.country),
      street,
      locality: details.locality || '',
      administrative_area_level_2: details.administrative_area_level_2 || '',
      administrative_area_level_1: details.administrative_area_level_1 || '',
      country: details.country || '',
      postal_code: details.postal_code || '',
      unit: details.unit || '',
      route: details.route || '',
      street_number: details.street_number || '',
    }
  } catch (error) {
    console.error('Failed to fetch place details:', error)
    return null
  }
}

export default function PatientContactInformationSection(
  { address }: { address?: Address },
) {
  const country = useSignal(address?.country || 'South Africa')

  const selected_address = useSignal<AddressSuggestion | null>(null)

  const street = useSignal(address?.street || '')
  const locality = useSignal(address?.locality || '')
  const admin2 = useSignal(address?.administrative_area_level_2 || '')
  const admin1 = useSignal(address?.administrative_area_level_1 || '')

  const formatted = compact([
    street.value,
    locality.value,
    country.value,
  ]).join(', ')

  const address_json = useMemo(() => {
    return JSON.stringify({
      formatted,
      country: country.value,
      street: street.value || null,
      locality: locality.value || null,
      administrative_area_level_2: admin2.value || null,
      administrative_area_level_1: admin1.value || null,
      route: null,
      street_number: null,
      postal_code: null,
      unit: null,
    })
  }, [
    formatted,
    country.value,
    street.value,
    locality.value,
    admin2.value,
    admin1.value,
  ])

  const handleAddressSelect = async (suggestion: AddressSuggestion) => {
    selected_address.value = suggestion

    if (!suggestion?.id) {
      street.value = ''
      locality.value = ''
      admin2.value = ''
      admin1.value = ''
      return
    }

    const details = await fetchPlaceDetails(suggestion.id)
    if (!details) return

    street.value = details.street || ''
    locality.value = details.locality || ''
    admin2.value = details.administrative_area_level_2 || ''
    admin1.value = details.administrative_area_level_1 || ''
    if (details.country) country.value = details.country
  }

  return (
    <FormSection header='Patient Contact Information'>
      <FormGrid columns={2}>
        <CountrySelect
          name='country_ui'
          label='Country'
          required
          value={country.value || 'ZA'}
        />

        <PhoneNumberInput
          name='phone_number'
          label='Phone Number'
          required
        />
      </FormGrid>

      <div class='mt-4'>
        <AsyncSearch<AddressSuggestion>
          search_route='?search='
          signal={selected_address}
          onSelect={handleAddressSelect}
          skip_blank_search
          placeholder='Start typing an address...'
          label='Address'
          required
          Option={({ option, active }) => (
            <div class='py-1'>
              <div class={active ? 'font-medium' : 'font-normal'}>
                {option.main_text}
              </div>
              <div class='text-sm text-gray-500'>
                {option.secondary_text}
              </div>
            </div>
          )}
        />

        {!!formatted && (
          <div class='mt-2 text-sm text-gray-600'>
            {formatted}
          </div>
        )}
      </div>

      <input type='hidden' name='address' value={address_json} />
    </FormSection>
  )
}
