import { sql } from 'kysely'
import { jsonArrayFrom } from '../helpers.ts'
import { Address, CountryAddressTree, TrxOrDb } from '../../types.ts'

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

export function upsert(
  trx: TrxOrDb,
  address: Address,
) {
  return trx
    .insertInto('address')
    .values(address)
    .onConflict((oc) =>
      oc.constraint('address_street_suburb_ward').doUpdateSet(address)
    )
    .returningAll()
    .executeTakeFirstOrThrow()
}

export function formatted(trx: TrxOrDb) {
  return trx
    .selectFrom('address')
    .leftJoin('suburbs', 'suburbs.id', 'address.suburb_id')
    .leftJoin('wards', 'wards.id', 'address.ward_id')
    .leftJoin('districts', 'districts.id', 'address.district_id')
    .leftJoin('provinces', 'provinces.id', 'address.province_id')
    .leftJoin('countries', 'countries.id', 'address.country_id')
    .select([
      'address.id',
      sql<string>`
        ARRAY_TO_STRING(
          ARRAY(
              SELECT DISTINCT UNNEST(ARRAY[
                  address.street,
                  suburbs.name,
                  wards.name,
                  districts.name,
                  provinces.name,
                  countries.name
              ]) ORDER BY 1
          ),
          ', '
        )
      `.as('address'),
    ])
    .as('address_formatted')
}
