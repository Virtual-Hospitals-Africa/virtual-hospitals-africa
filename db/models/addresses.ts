import { TrxOrDb } from '../../types.ts'
import compact from '../../util/compact.ts'
import uniq from '../../util/uniq.ts'
import { assertOr400, StatusError } from '../../util/assertOr.ts'
import { countries } from '../seed/defs/03_countries.ts'

export type AddressInsert = {
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
const TO_COUNTRY_ISO_3601 = new Map<string, string>()

// ZA => South Africa
const TO_COUNTRY_FULL_NAME = new Map<string, string>()

countries.forEach(({ full_name, iso_3166 }) => {
  TO_COUNTRY_ISO_3601.set(full_name, iso_3166)
  TO_COUNTRY_FULL_NAME.set(iso_3166, full_name)
})

export function insert(
  trx: TrxOrDb,
  address: AddressInsert,
) {
  let {
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
  if (TO_COUNTRY_ISO_3601.has(country)) {
    country_iso_3601 = TO_COUNTRY_ISO_3601.get(country)!
  } else if (TO_COUNTRY_FULL_NAME.has(country)) {
    country_full_name = TO_COUNTRY_FULL_NAME.get(country)!
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

    const streetParts = compact(street.split(' '))
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
  return trx.insertInto('addresses')
    .values({
      ...address,
      street,
      formatted,
      street_number,
      route,
      unit,
      country: country_iso_3601,
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}
