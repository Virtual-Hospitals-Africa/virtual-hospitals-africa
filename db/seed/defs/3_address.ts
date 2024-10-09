import { TrxOrDb } from '../../../types.ts'
import parseJSON from '../../../util/parseJSON.ts'
import { create } from '../create.ts'

type AdminDistrict = {
  countries: Country[]
}

type Country = {
  name: string
  provinces: Province[]
}

type Province = {
  name: string
  districts: District[]
}

type District = {
  name: string
  wards: Ward[]
}

type Ward = {
  name: string
}

type Suburb = {
  name: string
}

export default create([
  'countries',
  'provinces',
  'districts',
  'wards',
], importData)

async function getDataFromJSON(): Promise<AdminDistrict> {
  const data: Promise<AdminDistrict> = await parseJSON(
    './db/resources/zimbabwe-admin-district.json',
  )
  return data
}

async function importData(trx: TrxOrDb) {
  const data = await getDataFromJSON()
  for await (
    const country of data.countries
  ) {
    const country_id = await insertCountry(trx, country)
    for await (
      const province of country.provinces
    ) {
      const province_id = await insertProvince(trx, province, country_id)
      for await (
        const district of province.districts
      ) {
        const district_id = await insertDistrict(trx, district, province_id)
        for await (
          const ward of district.wards
        ) {
          await insertWard(trx, ward, district_id)
        }
      }
    }
  }
}

async function insertCountry(trx: TrxOrDb, country: Country) {
  const result = await trx.insertInto('countries').values({
    id: '10000000-0000-0000-0000-000000000000',
    name: country.name,
  }).returningAll().executeTakeFirstOrThrow()
  return result.id
}

async function insertProvince(
  trx: TrxOrDb,
  province: Province,
  country_id: string,
) {
  const result = await trx.insertInto('provinces').values({
    name: province.name,
    country_id,
  }).returningAll().executeTakeFirstOrThrow()
  return result.id
}

async function insertDistrict(
  trx: TrxOrDb,
  district: District,
  province_id: string,
) {
  const result = await trx.insertInto('districts').values({
    name: district.name,
    province_id,
  }).returningAll().executeTakeFirstOrThrow()
  return result.id
}

async function insertWard(
  trx: TrxOrDb,
  ward: Ward,
  district_id: string,
) {
  const result = await trx.insertInto('wards').values({
    name: ward.name,
    district_id,
  }).returningAll().executeTakeFirstOrThrow()
  return result.id
}
