import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'
import parseCsv from '../../util/parseCsv.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('wards')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('district_id', 'integer', (col) =>
      col.notNull()
        .references('districts.id')
        .onDelete('cascade'))
    .addUniqueConstraint('ward_name', ['name', 'district_id'])
    .execute()

  await addUpdatedAtTrigger(db, 'wards')
  await importWardsFromCSV(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema
    .dropTable('wards').execute()
}

async function importWardsFromCSV(db: Kysely<any>) {
  for await (
    const row of parseCsv('./db/resources/zimbabwe-wards.csv')
  ) {
    await sql`
      INSERT INTO wards (
        name,
        district_id
      ) VALUES (
        ${row.name},
        ${row.district_id}
      )
    `.execute(db)
  }
}
