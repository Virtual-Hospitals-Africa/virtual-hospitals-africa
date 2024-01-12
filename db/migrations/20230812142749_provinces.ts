import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('provinces')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'created_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('country_id', 'integer', (col) =>
      col.notNull()
        .references('countries.id')
        .onDelete('cascade'))
    .addUniqueConstraint('province_name', ['name'])
    .execute()

  await addUpdatedAtTrigger(db, 'provinces')
}

export async function down(db: Kysely<unknown>) {
  await db.schema
    .dropTable('provinces').execute()
}
