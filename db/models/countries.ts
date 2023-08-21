import { AdminDistricts, TrxOrDb } from '../../types.ts'

export async function getAdminDistInfo(
  trx: TrxOrDb,
): Promise<AdminDistricts[]> {
  return await trx
    .selectFrom('countries')
    .innerJoin(
      'provinces',
      'countries.id',
      'provinces.country_id',
    )
    .innerJoin(
      'districts',
      'provinces.id',
      'districts.province_id',
    )
    .innerJoin(
      'wards',
      'districts.id',
      'wards.district_id',
    )
    .leftJoin(
      'suburbs',
      'wards.id',
      'suburbs.ward_id',
    )
    .select([
      'countries.id as countryId',
      'countries.name as countryName',
      'provinces.id as provinceId',
      'provinces.name as provinceName',
      'districts.id as districtId',
      'districts.name as districtName',
      'wards.id as wardId',
      'wards.name as wardName',
      'suburbs.id as suburbId',
      'suburbs.name as suburbName',
    ])
    .orderBy('countries.name', 'asc')
    .orderBy('provinces.name', 'asc')
    .orderBy('districts.name', 'asc')
    .orderBy('wards.name', 'asc')
    .orderBy('suburbs.name', 'asc')
    .execute()
}
