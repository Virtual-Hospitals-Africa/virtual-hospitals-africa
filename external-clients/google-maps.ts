import { assert } from 'std/assert/assert.ts'

import {
  Coordinates,
  GoogleAddressComponent,
  LocationDistance,
} from '../types.ts'
import { cacheable } from './cache.ts'
import { AddressInsert } from '../db/models/addresses.ts'
import { getEnvVariableRequiredOutsideDockerQuickstart } from '../util/getEnvVariableRequiredOutsideDockerQuickstart.ts'

const GOOGLE_MAPS_API_KEY = getEnvVariableRequiredOutsideDockerQuickstart(
  'GOOGLE_MAPS_API_KEY',
)

export const getLocationAddress = cacheable(async function getLocationAddress(
  { longitude, latitude }: Coordinates,
): Promise<AddressInsert | null> {
  const results = await getGeocodeData(latitude, longitude)
  return getAddressFromData(results)
})

export async function getGeocodeData(
  latitude: number,
  longitude: number,
): Promise<GoogleAddressComponent[] | undefined> {
  const encodedLatitude = encodeURIComponent(latitude)
  const encodedLongitude = encodeURIComponent(longitude)
  const url =
    `https://maps.googleapis.com/maps/api/geocode/json?latlng=${encodedLatitude},${encodedLongitude}&key=${GOOGLE_MAPS_API_KEY}`
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
  const regex =
    /^(?!.*unnamed)(?=.*?(shop|stand|road|complex|hospital|rd|avenue|station))/i
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

export const getWalkingDistance = cacheable(async function getWalkingDistance(
  locations: LocationDistance,
): Promise<string | null> {
  const originCoords =
    `${locations.origin.latitude},${locations.origin.longitude}`
  const destCoords =
    `${locations.destination.latitude},${locations.destination.longitude}`
  const mode = `walking`

  const url =
    `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${originCoords}&destinations=${destCoords}&mode=${mode}&key=${GOOGLE_MAPS_API_KEY}`

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
})
