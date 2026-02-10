import { InsertObject } from 'kysely'
import { InsertShapeLiteral, Maybe, TrxOrDb } from '../../types.ts'
import compact from '../../util/compact.ts'
import uniq from '../../util/uniq.ts'
import { StatusError } from '../../util/assertOr.ts'
import { COUNTRIES } from '../../shared/countries.ts'
import { DB } from '../../db.d.ts'

export type AddressInsert = InsertShapeLiteral<InsertObject<DB, 'addresses'>>

const isApartmentOrUnit = (word: string) => {
  const lower_word = word.toLowerCase()
  return lower_word === 'apartment' || lower_word === 'unit' ||
    lower_word === 'suite' || lower_word === 'apt' || lower_word === 'ste'
}

// South Africa => ZA
export const TO_COUNTRY_ISO_3601_2 = new Map<string, string>()

// ZA => South Africa
export const TO_COUNTRY_OFFICIAL_NAME = new Map<string, string>()

COUNTRIES.forEach((country) => {
  TO_COUNTRY_OFFICIAL_NAME.set(country.iso_3166_2, country.official_name)
  TO_COUNTRY_ISO_3601_2.set(country.official_name, country.iso_3166_2)
  for (const alternate_name of country.alternate_names || []) {
    TO_COUNTRY_ISO_3601_2.set(alternate_name, country.iso_3166_2)
  }
})

export const addresses = {
  insertValues(address: AddressInsert) {
    let {
      id,
      street_number,
      route,
      unit,
      street,
      country,
    } = address

    let country_full_name = country
    let country_iso_3601 = country
    if (TO_COUNTRY_ISO_3601_2.has(country)) {
      country_iso_3601 = TO_COUNTRY_ISO_3601_2.get(country)!
    } else if (TO_COUNTRY_OFFICIAL_NAME.has(country)) {
      country_full_name = TO_COUNTRY_OFFICIAL_NAME.get(country)!
    } else {
      throw new StatusError(`Unrecognized country ${country}`, 400)
    }

    // Extract street number, route, and unit from street if it is present and route is not
    if (street && !route) {
      const street_parts = compact(street.split(' '))
      if (street_parts.length > 1 && !isNaN(parseInt(street_parts[0]))) {
        street_number = street_parts.shift()
      }

      const maybe_apt = street_parts[street_parts.length - 2]
      if (maybe_apt && isApartmentOrUnit(maybe_apt)) {
        const unit_number = street_parts.pop()
        const apt_description = street_parts.pop()
        unit = `${apt_description} ${unit_number}`
      } else {
        const maybe_unit = street_parts[street_parts.length - 1]
        if (/\d/.test(maybe_unit)) {
          unit = street_parts.pop()
        }
      }

      route = street_parts.join(' ')
    }

    street = street || compact([
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
  },

  insert(
    trx: TrxOrDb,
    address: AddressInsert,
  ) {
    return trx.insertInto('addresses')
      .values(address)
      .returningAll()
      .executeTakeFirstOrThrow()
  },

  distinctLocalities(
    trx: TrxOrDb,
    { country, search, limit }: {
      country: string
      search?: Maybe<string>
      limit: number
    },
  ) {
    let qb = trx.selectFrom('addresses')
      .where('country', '=', country)
      .where('locality', 'is not', null)
      .select((eb) => eb.ref('locality').$notNull().as('locality'))
      .distinct()
      .limit(limit)

    if (search) {
      qb = qb.where('locality', 'ilike', `%${search}%`)
    }
    return qb.execute()
  },

  distinctAdministrativeAreaLevels1(
    trx: TrxOrDb,
    { country, search, limit }: {
      country: string
      search?: Maybe<string>
      limit: number
    },
  ) {
    let qb = trx.selectFrom('addresses')
      .where('country', '=', country)
      .where('administrative_area_level_1', 'is not', null)
      .select((eb) =>
        eb.ref('administrative_area_level_1').$notNull().as(
          'administrative_area_level_1',
        )
      )
      .distinct()
      .limit(limit)

    if (search) {
      qb = qb.where('administrative_area_level_1', 'ilike', `%${search}%`)
    }
    return qb.execute()
  },

  distinctAdministrativeAreaLevels2(
    trx: TrxOrDb,
    { country, search, limit }: {
      country: string
      search?: Maybe<string>
      limit: number
    },
  ) {
    let qb = trx.selectFrom('addresses')
      .where('country', '=', country)
      .where('administrative_area_level_2', 'is not', null)
      .select((eb) =>
        eb.ref('administrative_area_level_2').$notNull().as(
          'administrative_area_level_2',
        )
      )
      .distinct()
      .limit(limit)

    if (search) {
      qb = qb.where('administrative_area_level_2', 'ilike', `%${search}%`)
    }
    return qb.execute()
  },
}
