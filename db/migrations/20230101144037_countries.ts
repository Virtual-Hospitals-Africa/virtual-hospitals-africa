import { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('countries')
    .addColumn(
      'iso_3166',
      'varchar(2)',
      (col) => col.notNull().primaryKey(),
    )
    .addColumn('full_name', 'varchar(255)', (col) => col.notNull().unique())
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('countries').execute()
}
