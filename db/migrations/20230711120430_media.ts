import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema.createTable('media')
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
    .addColumn('mime_type', 'varchar(255)', (col) => col.notNull())
    .addColumn('binary_data', 'bytea', (col) => col.notNull())
    .execute()

  await addUpdatedAtTrigger(db, 'media')
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('media').execute()
}
