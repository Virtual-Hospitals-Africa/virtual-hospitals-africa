import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'
import * as google from '../../external-clients/google.ts'
import parseCsv from '../../util/parseCsv.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createType('facility_category')
    .asEnum(['clinic', 'hospital'])
    .execute()

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
    .addColumn(
      'category',
      sql`facility_category`,
      (column) => column.defaultTo('clinic'),
    )
    .addColumn('vha', 'boolean')
    .addColumn('url', 'text')
    .addColumn('phone', 'varchar(255)')
    .execute()

  await addUpdatedAtTrigger(db, 'facilities')

  await importDataFromCSV(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('facilities').execute()
  await db.schema.dropType('facility_category').execute()
}

// TODO: Can't get last column properly, maybe because new line character
// So need a extra column in csv file
async function importDataFromCSV(db: Kysely<unknown>) {
  for await (
    const row of parseCsv('./db/resources/zimbabwe-health-facilities.csv')
  ) {
    const address = await google.getLocationAddress({
      longitude: Number(row.longitude),
      latitude: Number(row.latitude),
    })

    await sql`
      INSERT INTO facilities (
        name,
        location,
        address,
        category,
        vha,
        url,
        phone
      ) VALUES (
        ${row.name},
        ST_SetSRID(ST_MakePoint(${row.longitude}, ${row.latitude}), 4326),
        ${address},
        ${row.category},
        ${row.vha},
        ${row.url},
        ${row.phone}
      )
    `.execute(db)
  }
}
