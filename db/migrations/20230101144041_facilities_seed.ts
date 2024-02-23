import { Kysely, sql } from 'kysely'
import * as google from '../../external-clients/google.ts'
import parseCsv from '../../util/parseCsv.ts'
import capitalize from '../../util/capitalize.ts'
import { createSeedMigration } from '../seedMigration.ts'

export default createSeedMigration(
  ['facilities'],
  async (db: Kysely<unknown>) => {
    await addTestFacility(db)
    await importDataFromCSV(db)
  },
)

// Add a test facility with all VHA employees as admins
// deno-lint-ignore no-explicit-any
export function addTestFacility(db: Kysely<any>) {
  return db.insertInto('facilities').values({
    name: 'VHA Test Hospital',
    location: sql`ST_SetSRID(ST_MakePoint(2.25, 51), 4326)`,
    address: 'Bristol, UK',
    category: 'Hospital',
    phone: null,
  })
    .returningAll()
    .execute()
}

// TODO: Can't get last column properly, maybe because new line character
// So need a extra column in csv file
async function importDataFromCSV(db: Kysely<unknown>) {
  for await (
    const row of parseCsv('./db/resources/zimbabwe-health-facilities.csv')
  ) {
    let address = row.address
    if (address === 'UNKNOWN' && !Deno.env.get('SKIP_GOOGLE_MAPS')) {
      address = await google.getLocationAddress({
        longitude: Number(row.longitude),
        latitude: Number(row.latitude),
      })
    }

    const category = row.category?.trim()
    const category_capitalized = category && capitalize(category)
    const name = category_capitalized
      ? (row.name + ' ' + category_capitalized)
      : row.name

    await sql`
      INSERT INTO facilities (
        name,
        location,
        address,
        category,
        phone
      ) VALUES (
        ${name},
        ST_SetSRID(ST_MakePoint(${row.longitude}, ${row.latitude}), 4326),
        ${address},
        ${category_capitalized},
        ${row.phone}
      )
    `.execute(db)
  }
}
