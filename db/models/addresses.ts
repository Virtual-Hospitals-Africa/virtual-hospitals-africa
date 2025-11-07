import { TrxOrDb } from '../../types.ts'
import compact from '../../util/compact.ts'
import uniq from '../../util/uniq.ts'
import { assertOr400, StatusError } from '../../util/assertOr.ts'
import { countries } from '../seed/defs/05_countries.ts'

export type AddressInsert = {
  id?: string
  street_number?: string
  route?: string
  unit?: string
  street?: string
  locality: string
  administrative_area_level_1?: string
  administrative_area_level_2?: string
  country: string
  postal_code?: string
}

const isApartmentOrUnit = (word: string) => {
  const lower_word = word.toLowerCase()
  return lower_word === 'apartment' || lower_word === 'unit' ||
    lower_word === 'suite' || lower_word === 'apt' || lower_word === 'ste'
}

// South Africa => ZA
export const TO_COUNTRY_ISO_3601_2 = new Map<string, string>()

// ZA => South Africa
export const TO_COUNTRY_OFFICIAL_NAME = new Map<string, string>()

countries.forEach((country) => {
  TO_COUNTRY_OFFICIAL_NAME.set(country.iso_3166_2, country.official_name)
  TO_COUNTRY_ISO_3601_2.set(country.official_name, country.iso_3166_2)
  for (const alternate_name of country.alternate_names) {
    TO_COUNTRY_ISO_3601_2.set(alternate_name, country.iso_3166_2)
  }
})

export function insertValues(address: AddressInsert) {
  let {
    id,
    street_number,
    route,
    unit,
    street,
    country,
  } = address
  if (route) {
    assertOr400(!street, 'street is not allowed when route is present')
  }

  let country_full_name = country
  let country_iso_3601 = country
  if (TO_COUNTRY_ISO_3601_2.has(country)) {
    country_iso_3601 = TO_COUNTRY_ISO_3601_2.get(country)!
  } else if (TO_COUNTRY_OFFICIAL_NAME.has(country)) {
    country_full_name = TO_COUNTRY_OFFICIAL_NAME.get(country)!
  } else {
    throw new StatusError(`Unrecognized country ${country}`, 400)
  }

  // Extract street number, route, and unit from street if present
  if (street) {
    assertOr400(
      !street_number,
      'street_number is not allowed when street is present',
    )
    assertOr400(!route, 'route is not allowed when street is present')
    assertOr400(!unit, 'unit is not allowed when street is present')

    const street_parts = compact(street.split(' '))
    if (streetParts.length > 1 && !isNaN(parseInt(streetParts[0]))) {
      street_number = streetParts.shift()
    }

    const maybe_apt = streetParts[streetParts.length - 2]
    if (maybe_apt && isApartmentOrUnit(maybe_apt)) {
      const unit_number = streetParts.pop()
      const apt_description = streetParts.pop()
      unit = `${apt_description} ${unit_number}`
    } else {
      const maybe_unit = streetParts[streetParts.length - 1]
      if (/\d/.test(maybe_unit)) {
        unit = streetParts.pop()
      }
    }

    route = streetParts.join(' ')
  }

  street = compact([
    street_number,
    route,
    unit,
  ]).join(' ') || undefined

  const formatted = compact([
    street,
    ...uniq([
      address.locality,
      address.administrative_area_level_2,
      address.administrative_area_level_1,
    ]),
    country_full_name,
    address.postal_code,
  ]).join(', ')

  return {
    ...address,
    id,
    street,
    formatted,
    street_number,
    route,
    unit,
    country: country_iso_3601,
  }
}

export function insert(
  trx: TrxOrDb,
  address: AddressInsert,
) {
  return trx.insertInto('addresses')
    .values(insertValues(address))
    .returningAll()
    .executeTakeFirstOrThrow()
}
