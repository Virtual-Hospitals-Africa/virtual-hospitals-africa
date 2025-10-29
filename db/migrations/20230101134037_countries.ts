import { Kysely, sql } from 'kysely'
import { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await db.schema
    .createTable('countries')
    .addColumn(
      'iso_3166_2',
      'varchar(2)',
      (col) =>
        col.notNull().primaryKey().check(
          sql`LENGTH(iso_3166_2) = 2 AND iso_3166_2 ~ '^[A-Z]+$'`,
        ),
    )
    .addColumn(
      'iso_3166_3',
      'varchar(3)',
      (col) =>
        col.notNull().unique().check(
          sql`LENGTH(iso_3166_3) = 3 AND iso_3166_3 ~ '^[A-Z]+$'`,
        ),
    )
    .addColumn(
      'official_name',
      'varchar(255)',
      (col) => col.notNull().unique(),
    )
    .addColumn('alternate_names', sql`varchar(255)[]`)
    .addColumn('emoji', 'varchar(3)')
    .addColumn(
      'phone_code',
      'varchar(5)',
      (col) =>
        col.check(
          sql`phone_code is null or SUBSTRING(phone_code, 1, 1) != '+'`,
        ),
    )
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('countries').execute()
}
