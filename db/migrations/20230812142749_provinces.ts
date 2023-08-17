import { Kysely } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('provinces')
    .addColumn('id', 'serial', (col) => col.primaryKey())
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
