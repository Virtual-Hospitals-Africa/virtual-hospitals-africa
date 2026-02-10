import { Kysely } from 'kysely'
import { DB } from '../../db.d.ts'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(
    db,
    'addresses',
    (qb) =>
      qb
        .addColumn('google_maps_place_id', 'varchar(255)')
        .addColumn('formatted', 'varchar(255)', (col) => col.notNull())
        .addColumn('street_number', 'varchar(255)')
        .addColumn('route', 'varchar(255)')
        .addColumn('unit', 'varchar(255)')
        .addColumn('street', 'varchar(255)')
        .addColumn('locality', 'varchar(255)')
        .addColumn('postal_code', 'varchar(255)')
        .addColumn('administrative_area_level_1', 'varchar(255)')
        .addColumn('administrative_area_level_2', 'varchar(255)')
        .addColumn('country', 'varchar(2)', (col) => col.notNull().references('countries.iso_3166_2')),
  )

  await db.schema
    .createIndex('idx_addresses_country')
    .on('addresses')
    .column('country')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('addresses').execute()
}
