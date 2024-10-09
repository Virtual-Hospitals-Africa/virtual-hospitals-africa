import { jsonArrayFrom } from '../helpers.ts'
import { CountryAddressTree, TrxOrDb } from '../../types.ts'
import compact from '../../util/compact.ts'
import uniq from '../../util/uniq.ts'
import { assertOr400 } from '../../util/assertOr.ts'

let fullCountryInfo: CountryAddressTree | undefined
export async function getCountryAddressTree(
  trx: TrxOrDb,
): Promise<CountryAddressTree> {
  if (fullCountryInfo) return fullCountryInfo
  return fullCountryInfo = await trx
    .selectFrom('countries')
    .select((ebProvinces) => [
      'id',
      'name',
      jsonArrayFrom(
        ebProvinces.selectFrom('provinces')
          .select((ebDistricts) => [
            'id',
            'name',
            jsonArrayFrom(
              ebDistricts.selectFrom('districts')
                .select((ebWards) => [
                  'id',
                  'name',
                  jsonArrayFrom(
                    ebWards.selectFrom('wards')
                      .select([
                        'id',
                        'name',
                      ])
                      .whereRef('wards.district_id', '=', 'districts.id'),
                  ).as('wards'),
                ])
                .whereRef('districts.province_id', '=', 'provinces.id'),
            ).as('districts'),
          ])
          .whereRef('provinces.country_id', '=', 'countries.id'),
      ).as('provinces'),
    ])
    .execute()
}

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

export function insert(
  trx: TrxOrDb,
  address: AddressInsert,
) {
  let {
    street_number,
    route,
    unit,
    street,
  } = address
  if (route) {
    assertOr400(!street, 'street is not allowed when route is present')
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
    address.country,
    address.postal_code,
  ]).join(', ')
  return trx.insertInto('addresses')
    .values({
      street,
      formatted,
      street_number,
      route,
      unit,
      ...address,
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}
