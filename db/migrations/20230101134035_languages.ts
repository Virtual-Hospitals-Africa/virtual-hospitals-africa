import { DB } from '../../db.d.ts'
import { Kysely } from 'kysely'

export async function up(db: Kysely<DB>) {
  await db.schema
    .createTable('iso_639_1_languages')
    .addColumn(
      'iso_639_1',
      'varchar(2)',
      (col) => col.primaryKey(),
    )
    .addColumn('english_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('endonym', 'varchar(255)')
    .execute()

  await db.schema
    .createTable('iso_639_2_b_languages')
    .addColumn(
      'iso_639_2_b',
      'varchar(3)',
      (col) => col.primaryKey(),
    )
    .addColumn(
      'iso_639_1',
      'varchar(2)',
      (col) => col.notNull().references('iso_639_1_languages.iso_639_1'),
    )
    .addColumn('english_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('endonym', 'varchar(255)')
    .execute()

  await db.schema
    .createTable('iso_639_3_languages')
    .addColumn(
      'iso_639_3',
      'varchar(3)',
      (col) => col.primaryKey(),
    )
    .addColumn(
      'iso_639_2_b',
      'varchar(3)',
      (col) => col.notNull().references('iso_639_2_b_languages.iso_639_2_b'),
    )
    .addColumn('english_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('endonym', 'varchar(255)')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('iso_639_3_languages').execute()
  await db.schema.dropTable('iso_639_2_b_languages').execute()
  await db.schema.dropTable('iso_639_1_languages').execute()
}
