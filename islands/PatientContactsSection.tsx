import { useMemo } from 'preact/hooks'
import { useSignal } from '@preact/signals'
import FormSection from '../components/library/FormSection.tsx'
import CountrySelect from './CountrySelect.tsx'
import { Address } from '../types.ts'
import { PhoneNumberInput } from './form/inputs/phone_number.tsx'
import FormGrid from '../components/library/FormGrid.tsx'
import AsyncSearch from './AsyncSearch.tsx'
import { OptionLike } from './Search.tsx'
import { assert } from 'std/assert/assert.ts'

type AddressSuggestion = OptionLike & {
  main_text: string
  secondary_text: string
}

function formatAddress(street_number?: string, route?: string, locality?: string, country?: string) {
  const full_street = [street_number, route].filter(Boolean).join(' ').trim()
  return [full_street, locality, country].filter(Boolean).join(', ')
}

async function fetchPlaceDetails(place_id: string, organization_id: string): Promise<Address | null> {
  const url = new URL(`${globalThis.location.origin}/app/organizations/${organization_id}/google_maps_responses`)
  url.search = ''
  url.searchParams.set('place_id', place_id)

  const response = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
    },
  })

  assert(response.ok, 'Failed to fetch place details')

  const details = await response.json()
  console.log('Fetched place details:', details)

  if (!details) return null

  const has_route = !!details.route || !!details.street_number

  const street = has_route ? undefined : `${details.street_number || ''} ${details.route || ''}`.trim() || undefined

  return {
    formatted: formatAddress(details.street_number, details.route, details.locality, details.country),
    locality: details.locality || '',
    administrative_area_level_2: details.administrative_area_level_2 || '',
    administrative_area_level_1: details.administrative_area_level_1 || '',
    country: details.country || '',
    postal_code: details.postal_code || '',
    unit: details.unit || '',
    route: details.route || '',
    street_number: details.street_number || '',
    street,
  }
}

export default function PatientContactInformationSection(
  { address, phone_number, organization_id }: { address?: Address; phone_number?: string; organization_id?: string },
) {
  const country = useSignal(address?.country || 'South Africa')
  const street = useSignal(address?.street || '')
  const locality = useSignal(address?.locality || '')
  const admin2 = useSignal(address?.administrative_area_level_2 || '')
  const admin1 = useSignal(address?.administrative_area_level_1 || '')
  const postal = useSignal(address?.postal_code || '')
  const unit = useSignal(address?.unit || '')
  const route = useSignal(address?.route || '')
  const street_number = useSignal(address?.street_number || '')

  const formatted = useMemo(() => {
    return formatAddress(street_number.value, route.value, locality.value, country.value)
  }, [street_number.value, route.value, locality.value, country.value])

  const handleSelect = async (opt: AddressSuggestion) => {
    // opt.id is your place_id
    const details = await fetchPlaceDetails(opt.id!, organization_id!)
    if (!details) return

    street.value = details.street || ''
    locality.value = details.locality || ''
    admin2.value = details.administrative_area_level_2 || ''
    admin1.value = details.administrative_area_level_1 || ''
    postal.value = details.postal_code || ''
    unit.value = details.unit || ''
    route.value = details.route || ''
    street_number.value = details.street_number || ''
  }

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
          required
          value={phone_number || ''}
        />
      </FormGrid>

      <div class='mt-4'>
        <AsyncSearch<AddressSuggestion>
          search_route={`/app/organizations/${organization_id}/google_maps_responses?country=${country.value || 'ZA'}`}
          skip_blank_search
          placeholder='Start typing an address...'
          label='Address'
          onSelect={handleSelect}
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
      </div>

      <input
        type='hidden'
        name='address'
        value={JSON.stringify({
          formatted,
          country: country.value,
          administrative_area_level_1: admin1.value || null,
          administrative_area_level_2: admin2.value || null,
          locality: locality.value || null,
          route: route.value || null,
          street_number: street_number.value || null,
          unit: unit.value || null,
          street: street.value || null,
          postal_code: postal.value || null,
        })}
      />
    </FormSection>
  )
}
