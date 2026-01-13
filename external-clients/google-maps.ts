import { assert } from 'std/assert/assert.ts'

import { Coordinates, GoogleAddressComponent, LocationDistance } from '../types.ts'
import { cacheable } from './cache.ts'
import { AddressInsert } from '../db/models/addresses.ts'
import { getEnvVariableRequiredOutsideDockerQuickstart } from '../util/getEnvVariableRequiredOutsideDockerQuickstart.ts'

const GOOGLE_MAPS_API_KEY = getEnvVariableRequiredOutsideDockerQuickstart(
  'GOOGLE_MAPS_API_KEY',
)

// export const getLocationAddress = cacheable(
//   async function getLocationAddress(
//     { longitude, latitude }: Coordinates,
//   ): Promise<AddressInsert | null> {
//     const results = await getGeocodeData(latitude, longitude)
//     return getAddressFromData(results)
//   },
// )

export async function getLocationAddress(
  { longitude, latitude }: Coordinates,
): Promise<AddressInsert | null> {
  const results = await getGeocodeData(latitude, longitude)
  return getAddressFromData(results)
}

export async function getGeocodeData(
  latitude: number,
  longitude: number,
): Promise<GoogleAddressComponent[] | undefined> {
  const encoded_latitude = encodeURIComponent(latitude)
  const encoded_longitude = encodeURIComponent(longitude)
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encoded_latitude},${encoded_longitude}&key=${GOOGLE_MAPS_API_KEY}`
  const response = await fetch(url)
  if (!response.ok) {
    throw await response.text()
  }
  const data = await response.json()
  if (data.status === 'OK' && Array.isArray(data.results)) {
    return data.results
  }
}

const types_we_care_about = new Set([
  'administrative_area_level_1',
  'administrative_area_level_2',
  'country',
  'locality',
  'postal_code',
  'route',
  'street_number',
])

function isRouteUseful(route: string): boolean {
  const regex = /^(?!.*unnamed)(?=.*?(shop|stand|road|complex|hospital|rd|avenue|station))/i
  return regex.test(route)
}

function getAddressFromData(
  results?: GoogleAddressComponent[],
): AddressInsert | null {
  if (!results?.length) return null
  // deno-lint-ignore no-explicit-any
  const address: any = {}
  for (const result of results) {
    const types = result.types.filter((type) => type !== 'political')
    if (types.length !== 1) continue
    const [type] = types
    if (!types_we_care_about.has(type)) continue
    const address_component = result.address_components[0]
    assert(address_component)
    const value = address_component.long_name || address_component.slug
    assert(value, `No value for ${type}`)
    if (type === 'route' && !isRouteUseful(value)) continue
    address[type] = value
  }
  assert(address.country)
  return address
}

export const getWalkingDistance = cacheable(
  async function getWalkingDistance(
    locations: LocationDistance,
  ): Promise<string | null> {
    const origin_coords = `${locations.origin.latitude},${locations.origin.longitude}`
    const dest_coords = `${locations.destination.latitude},${locations.destination.longitude}`
    const mode = `walking`

    const url =
      `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin_coords}&destinations=${dest_coords}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`

    const result = await fetch(url)
    //assert(result.ok, 'Failed to fetch walking distance')
    if (!result.ok) {
      console.error('Failed to fetch walking distance')
      return null
    }
    const json = await result.json()
    //assert(json.status === 'OK', 'Invalid response from Google Maps API')
    if (json.status !== 'OK') {
      console.error('Invalid response from Google Maps API')
      return null
    }

    if (
      json.rows[0].elements[0].status === 'ZERO_RESULTS' ||
      json.rows[0].elements[0].status === 'NOT_FOUND'
    ) {
      return null
    }

    const distance = json.rows[0].elements[0].distance.text

    return distance
  },
)

export async function getAddressSuggestions(
  input: string,
  options?: {
    location?: Coordinates
    radius?: number
    country?: string
  },
): Promise<
  Array<{
    place_id: string
    description: string
    structured_formatting: {
      main_text: string
      secondary_text: string
    }
  }>
> {
  if (!input.trim()) return []

  const params = new URLSearchParams({
    input: input,
    key: GOOGLE_MAPS_API_KEY!,
  })

  if (options?.location) {
    params.append(
      'location',
      `${options.location.latitude},${options.location.longitude}`,
    )
    params.append('radius', String(options.radius || 50000))
  }

  if (options?.country) {
    params.append('components', `country:${options.country}`)
  }

  const url =
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to fetch address suggestions')
  }

  const data = await response.json()

  if (data.status === 'OK' && Array.isArray(data.predictions)) {
    return data.predictions
  }

  return []
}

export async function getPlaceDetails(
  place_id: string,
): Promise<AddressInsert | null> {
  const url =
    `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${GOOGLE_MAPS_API_KEY}`
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error('Failed to fetch place details')
  }

  const data = await response.json()

  if (data.status === 'OK' && data.result) {
    return getAddressFromData([{
      types: data.result.types,
      address_components: data.result.address_components,
      formatted_address: data.result.formatted_address,
    }])
  }

  return null
}
