import { Kysely } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await createStandardTable(db, 'events', (qb) =>
    qb
      .addColumn('type', 'varchar(255)', (col) => col.notNull())
      .addColumn('data', 'jsonb', (col) => col.notNull())
      .addColumn('error_message_no_automated_retry', 'text')
      .addColumn('listeners_inserted_at', 'timestamptz'))

  await createStandardTable(db, 'event_listeners', (qb) =>
    qb
      .addColumn('event_id', 'uuid', (col) =>
        col.notNull().references('events.id'))
      .addColumn('listener_name', 'varchar(255)', (col) =>
        col.notNull())
      .addColumn('error_message', 'text')
      .addColumn('error_count', 'integer', (col) =>
        col.notNull().defaultTo(0))
      .addColumn('backoff_until', 'timestamptz')
      .addColumn('processed_at', 'timestamptz')
      .addUniqueConstraint('single_listener', ['event_id', 'listener_name']))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('event_listeners').execute()
  await db.schema.dropTable('events').execute()
}
