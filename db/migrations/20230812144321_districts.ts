import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'
import parseCsv from '../../util/parseCsv.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('districts')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('province_id', 'integer', (col) =>
      col.notNull()
        .references('provinces.id')
        .onDelete('cascade'))
    .addUniqueConstraint('district_name', ['name', 'province_id'])
    .execute()

  await addUpdatedAtTrigger(db, 'districts')
  await importDistrictsFromCSV(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema
    .dropTable('districts').execute()
}

// deno-lint-ignore no-explicit-any
async function importDistrictsFromCSV(db: Kysely<any>) {
  for await (
    const row of parseCsv('./db/resources/zimbabwe-districts.csv')
  ) {
    await sql`
      INSERT INTO districts (
        name,
        province_id
      ) VALUES (
        ${row.name},
        ${row.province_id}
      )
    `.execute(db)
  }
}
