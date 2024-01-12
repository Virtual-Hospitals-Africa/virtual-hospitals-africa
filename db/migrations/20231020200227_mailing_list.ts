import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('mailing_list')
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
    .addColumn('email', 'varchar(255)', (col) => col.notNull())
    .addColumn('entrypoint', 'varchar(255)', (col) => col.notNull())
    .addUniqueConstraint('mailing_list_email', ['email'])
    .execute()

  await addUpdatedAtTrigger(db, 'mailing_list')
}

export function down(db: Kysely<unknown>) {
  return db.schema.dropTable('mailing_list').execute()
}
