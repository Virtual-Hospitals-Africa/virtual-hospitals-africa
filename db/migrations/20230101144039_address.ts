import { Kysely } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await createStandardTable(
    db,
    'addresses',
    (qb) =>
      qb.addColumn('formatted', 'varchar(255)', (col) => col.notNull())
        .addColumn('street_number', 'varchar(255)')
        .addColumn('route', 'varchar(255)')
        .addColumn('locality', 'varchar(255)')
        .addColumn('postal_code', 'varchar(255)')
        .addColumn('administrative_area_level_1', 'varchar(255)')
        .addColumn('administrative_area_level_2', 'varchar(255)')
        .addColumn('country', 'varchar(255)', (col) => col.notNull())
  )
}

// deno-lint-ignore no-explicit-any
export async function down(db: Kysely<any>) {
  await db.schema.dropTable('addresses').execute()
}
