import { Kysely } from 'kysely'
import parseJSON from '../../util/parseJSON.ts'
import { DB } from '../../db.d.ts'
import { createSeedMigration } from '../seedMigration.ts'

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

export default createSeedMigration([
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
    const countryId = await insertCountry(db, country)
    for await (
      const province of country.provinces
    ) {
      const provinceId = await insertProvince(db, province, countryId)
      for await (
        const district of province.districts
      ) {
        const districtId = await insertDistrict(db, district, provinceId)
        for await (
          const ward of district.wards
        ) {
          const wardId = await insertWard(db, ward, districtId)
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
    name: country.name,
  }).returningAll().executeTakeFirstOrThrow()
  return result.id
}

async function insertProvince(
  db: Kysely<DB>,
  province: Province,
  countryId: number,
) {
  const result = await db.insertInto('provinces').values({
    name: province.name,
    country_id: countryId,
  }).returningAll().executeTakeFirstOrThrow()
  return result.id
}

async function insertDistrict(
  db: Kysely<DB>,
  district: District,
  provinceId: number,
) {
  const result = await db.insertInto('districts').values({
    name: district.name,
    province_id: provinceId,
  }).returningAll().executeTakeFirstOrThrow()
  return result.id
}

async function insertWard(
  db: Kysely<DB>,
  ward: Ward,
  districtId: number,
) {
  const result = await db.insertInto('wards').values({
    name: ward.name,
    district_id: districtId,
  }).returningAll().executeTakeFirstOrThrow()
  return result.id
}

async function insertSuburb(
  db: Kysely<DB>,
  suburb: Suburb,
  wardId: number,
) {
  await db.insertInto('suburbs').values({
    name: suburb.name,
    ward_id: wardId,
  }).execute()
}
