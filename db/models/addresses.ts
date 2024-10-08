import { jsonArrayFrom } from '../helpers.ts'
import { CountryAddressTree, TrxOrDb } from '../../types.ts'
import compact from '../../util/compact.ts'
import uniq from '../../util/uniq.ts'

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
                      .select((ebSuburbs) => [
                        'id',
                        'name',
                        jsonArrayFrom(
                          ebSuburbs.selectFrom('suburbs')
                            .select([
                              'id',
                              'name',
                            ])
                            .whereRef(
                              'suburbs.ward_id',
                              '=',
                              'wards.id',
                            ),
                        ).as('suburbs'),
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
  locality: string
  administrative_area_level_1?: string
  administrative_area_level_2?: string
  country: string
  postal_code?: string
}

export function insert(trx: TrxOrDb, address: AddressInsert) {
  const formatted = compact([
    address.street_number,
    address.route,
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
      ...address,
      formatted,
    })
    .returningAll()
    .executeTakeFirstOrThrow()
}
