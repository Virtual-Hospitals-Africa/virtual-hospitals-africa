import { jsonArrayFrom } from '../helpers.ts'

import {
  Address,
  FullCountryInfo,
  Maybe,
  ReturnedSqlRow,
  TrxOrDb,
} from '../../types.ts'
export type UpsertableAddress = {
  street?: Maybe<string>
  suburb_id?: Maybe<number>
  ward_id?: Maybe<number>
  district_id?: Maybe<number>
  province_id?: Maybe<number>
  country_id?: Maybe<number>
}


export function getFullCountryInfo(
  trx: TrxOrDb,
): Promise<FullCountryInfo> {
  return trx
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


export function upsertAddress(
  trx: TrxOrDb,
  address: UpsertableAddress,
): Promise<ReturnedSqlRow<Address>> {
  const addressInfo = {
    street: address.street,
    suburb_id: address.suburb_id,
    ward_id: address.ward_id,
    district_id: address.district_id,
    province_id: address.province_id,
    country_id: address.country_id,
  }

  return trx
    .insertInto('address')
    .values({ ...addressInfo })
    .onConflict((oc) =>
      oc.columns(['street', 'suburb_id', 'ward_id']).doUpdateSet({
        ...addressInfo,
      })
    )
    .returningAll()
    .executeTakeFirstOrThrow()
}