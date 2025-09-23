import { Kysely, sql } from 'kysely'
import { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await db.schema
    .createTable('countries')
    .addColumn(
      'iso_3166_2',
      'varchar(2)',
      (col) => col.notNull().primaryKey(),
    )
    .addColumn(
      'iso_3166_3',
      'varchar(3)',
      (col) => col.notNull().unique(),
    )
    .addColumn(
      'official_name',
      'varchar(255)',
      (col) => col.notNull().unique(),
    )
    .addColumn('alternate_names', sql`varchar(255)[]`)
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('countries').execute()
}
