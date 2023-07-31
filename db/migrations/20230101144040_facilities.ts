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
    .addColumn('name', 'varchar(255)')
    .addColumn('location', sql`GEOGRAPHY(POINT,4326)`)
    .addColumn('address', 'text')
    .addColumn('category', 'text')
    .addColumn('vha', 'boolean')
    .addColumn('phone', 'varchar(255)')
    .execute()

  await addUpdatedAtTrigger(db, 'facilities')

  await importDataFromCSV(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('facilities').execute()
}

// TODO: Can't get last column properly, maybe because new line character
// So need a extra column in csv file
async function importDataFromCSV(db: Kysely<unknown>) {
  let i = 0
  for await (
    const row of parseCsv('./db/resources/zimbabwe-health-facilities.csv')
  ) {
    // TODO remove this
    i++
    if (i >= 10) return
    /*
    const address = Deno.env.get('SKIP_GOOGLE_MAPS')
      ? null
      : await google.getLocationAddress({
        longitude: Number(row.longitude),
        latitude: Number(row.latitude),
      })*/
      const address = row.address === 'UNKNOWN' ? Deno.env.get('SKIP_GOOGLE_MAPS')
      ? null
      : await google.getLocationAddress({
        longitude: Number(row.longitude),
        latitude: Number(row.latitude),
      }) : row.address

    await sql`
      INSERT INTO facilities (
        name,
        location,
        address,
        category,
        vha,
        phone
      ) VALUES (
        ${row.name},
        ST_SetSRID(ST_MakePoint(${row.longitude}, ${row.latitude}), 4326),
        ${address || 'Address unknown'},
        ${row.category},
        ${row.vha},
        ${row.phone}
      )
    `.execute(db)
  }
}
