import { Kysely } from 'kysely'
import parseJSON from '../../../util/parseJSON.ts'
import { DB } from '../../../db.d.ts'
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
  suburbs?: Suburb[]
}

type Suburb = {
  name: string
}

export default create([
  'countries',
  'provinces',
  'districts',
  'wards',
  'suburbs',
], importData)

async function getDataFromJSON(): Promise<AdminDistrict> {
  const data: Promise<AdminDistrict> = await parseJSON(
    './db/resources/zimbabwe-admin-district.json',
  )
  return data
}

async function importData(db: Kysely<DB>) {
  const data = await getDataFromJSON()
  for await (
    const country of data.countries
  ) {
    const country_id = await insertCountry(db, country)
    for await (
      const province of country.provinces
    ) {
      const province_id = await insertProvince(db, province, country_id)
      for await (
        const district of province.districts
      ) {
        const district_id = await insertDistrict(db, district, province_id)
        for await (
          const ward of district.wards
        ) {
          const wardId = await insertWard(db, ward, district_id)
          for await (
            const suburb of ward.suburbs ?? []
          ) {
            await insertSuburb(db, suburb, wardId)
          }
        }
      }
    }
  }
}

async function insertCountry(db: Kysely<DB>, country: Country) {
  const result = await db.insertInto('countries').values({
    id: '10000000-0000-0000-0000-000000000000',
    name: country.name,
  }).returningAll().executeTakeFirstOrThrow()
  return result.id
}

async function insertProvince(
  db: Kysely<DB>,
  province: Province,
  country_id: string,
) {
  const result = await db.insertInto('provinces').values({
    name: province.name,
    country_id,
  }).returningAll().executeTakeFirstOrThrow()
  return result.id
}

async function insertDistrict(
  db: Kysely<DB>,
  district: District,
  province_id: string,
) {
  const result = await db.insertInto('districts').values({
    name: district.name,
    province_id,
  }).returningAll().executeTakeFirstOrThrow()
  return result.id
}

async function insertWard(
  db: Kysely<DB>,
  ward: Ward,
  district_id: string,
) {
  const result = await db.insertInto('wards').values({
    name: ward.name,
    district_id,
  }).returningAll().executeTakeFirstOrThrow()
  return result.id
}

async function insertSuburb(
  db: Kysely<DB>,
  suburb: Suburb,
  ward_id: string,
) {
  await db.insertInto('suburbs').values({
    name: suburb.name,
    ward_id,
  }).execute()
}
