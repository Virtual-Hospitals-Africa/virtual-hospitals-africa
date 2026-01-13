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

type AddressDetails = {
  street?: string
  locality?: string
  administrative_area_level_2?: string
  administrative_area_level_1?: string
  country?: string
  route?: string
  street_number?: string
}

function buildDisplayAddress(details: AddressDetails): string {
  const parts = []

  if (details.street) {
    parts.push(details.street)
  }
  if (details.locality) {
    parts.push(details.locality)
  }
  if (details.country) {
    parts.push(details.country)
  }

  return parts.join(', ')
}

async function fetchPlaceDetails(
  place_id: string,
): Promise<AddressDetails | null> {
  try {
    const response = await fetch(`?place_id=${place_id}`)
    const details = await response.json()

    if (!details) return null

    return {
      street: details.route || details.street_number
        ? `${details.street_number || ''} ${details.route || ''}`.trim()
        : '',
      locality: details.locality || '',
      administrative_area_level_2: details.administrative_area_level_2 || '',
      administrative_area_level_1: details.administrative_area_level_1 || '',
      country: details.country || '',
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
  const selectedAddress = useSignal<AddressSuggestion | null>(null)

  const street = useSignal(address?.street || '')
  const locality = useSignal(address?.locality || '')
  const admin2 = useSignal(address?.administrative_area_level_2 || '')
  const admin1 = useSignal(address?.administrative_area_level_1 || '')

  const handleAddressSelect = async (suggestion: AddressSuggestion) => {
    selectedAddress.value = suggestion

    if (!suggestion) {
      street.value = ''
      locality.value = ''
      admin2.value = ''
      admin1.value = ''
      return
    }

    if (suggestion.id) {
      const details = await fetchPlaceDetails(suggestion.id)

      if (details) {
        street.value = details.street || ''
        locality.value = details.locality || ''
        admin2.value = details.administrative_area_level_2 || ''
        admin1.value = details.administrative_area_level_1 || ''
        if (details.country) {
          country.value = details.country
        }
      }
    }
  }

  return (
    <FormSection header='Patient Contact Information'>
      <FormGrid columns={2}>
        <CountrySelect
          name='country'
          label='Country'
          required
          defaultValue='South Africa'
          value={country.value}
        >
        </CountrySelect>
        <PhoneNumberInput
          name='phone_number'
          label='Phone Number'
          required
        >
        </PhoneNumberInput>
      </FormGrid>

      <div class='mt-4'>
        <AsyncSearch<AddressSuggestion>
          search_route='?search='
          signal={selectedAddress}
          onSelect={handleAddressSelect}
          skip_blank_search
          placeholder='Start typing an address...'
          label='Address'
          required
          onSearchResults={(search) => {
            console.log('Current search query:', search.query)
            console.log('Search results:', search)
          }}
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

        {locality.value && (
          <div class='mt-2 text-sm text-gray-600'>
            {buildDisplayAddress({
              street: street.value,
              locality: locality.value,
              country: country.value,
            })}
          </div>
        )}
      </div>

      <input type='hidden' name='address[street]' value={street.value} />
      <input type='hidden' name='address[locality]' value={locality.value} />
      <input
        type='hidden'
        name='address[administrative_area_level_2]'
        value={admin2.value}
      />
      <input
        type='hidden'
        name='address[administrative_area_level_1]'
        value={admin1.value}
      />
    </FormSection>
  )
}
