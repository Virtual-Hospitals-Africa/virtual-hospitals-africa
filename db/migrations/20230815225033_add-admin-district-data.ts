import { Kysely, sql } from 'kysely'
import parseJSON from '../../util/parseJSON.ts'
import { DatabaseSchema } from '../../db/db.ts'

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

export async function up(db: Kysely<unknown>) {
  const data = await getDataFromJSON()
  await importData(db, data)
}

export async function down(db: Kysely<unknown>) {
  await sql`DELETE FROM suburbs`.execute(db)
  await sql`DELETE FROM wards`.execute(db)
  await sql`DELETE FROM districts`.execute(db)
  await sql`DELETE FROM provinces`.execute(db)
  await sql`DELETE FROM countries`.execute(db)
}

async function getDataFromJSON(): Promise<AdminDistrict> {
  const data: Promise<AdminDistrict> = await parseJSON(
    './db/resources/zimbabwe-admin-district.json',
  )
  return data
}

async function importData(db: Kysely<unknown>, data: AdminDistrict) {
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

async function insertCountry(db: Kysely<any>, country: Country) {
  const result = await db.insertInto('countries').values({
    name: country.name,
  }).returningAll().executeTakeFirstOrThrow()
  return result.id
}

async function insertProvince(
  db: Kysely<DatabaseSchema>,
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
  db: Kysely<DatabaseSchema>,
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
  db: Kysely<DatabaseSchema>,
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
  db: Kysely<DatabaseSchema>,
  suburb: Suburb,
  wardId: number,
) {
  await db.insertInto('suburbs').values({
    name: suburb.name,
    ward_id: wardId,
  }).execute()
}
