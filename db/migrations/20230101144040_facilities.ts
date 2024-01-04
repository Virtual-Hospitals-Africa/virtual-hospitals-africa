import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'
import * as google from '../../external-clients/google.ts'
import parseCsv from '../../util/parseCsv.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('facilities')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'created_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('location', sql`GEOGRAPHY(POINT,4326)`, (col) => col.notNull())
    .addColumn('address', 'text', (col) => col.notNull())
    .addColumn('category', 'varchar(255)', (col) => col.notNull())
    .addColumn('phone', 'varchar(255)')
    .execute()

  await addUpdatedAtTrigger(db, 'facilities')

  await addTestFacility(db)
  await importDataFromCSV(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('facilities').execute()
}

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

    await sql`
      INSERT INTO facilities (
        name,
        location,
        address,
        category,
        phone
      ) VALUES (
        ${row.name},
        ST_SetSRID(ST_MakePoint(${row.longitude}, ${row.latitude}), 4326),
        ${address},
        ${row.category},
        ${row.phone}
      )
    `.execute(db)
  }
}
