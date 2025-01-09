import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export function up(db: Kysely<unknown>) {
  return createStandardTable(db, 'events', (qb) =>
    qb
      .addColumn('type', 'varchar(255)', (col) => col.notNull())
      .addColumn('data', 'jsonb', (col) => col.notNull())
      .addColumn('error_message', 'text')
      .addColumn('error_count', 'integer', (col) => col.notNull().defaultTo(0))
      .addColumn('error_no_retry', 'boolean', (col) =>
        col.notNull().defaultTo(false))
      .addColumn('errored_listeners', sql`varchar(255)[]`, (col) =>
        col.notNull().defaultTo(sql`ARRAY[]::varchar(255)[]`))
      .addColumn('processed_listeners', sql`varchar(255)[]`, (col) =>
        col.notNull().defaultTo(sql`ARRAY[]::varchar(255)[]`))
      .addColumn('backoff_until', 'timestamptz')
      .addColumn('processed_at', 'timestamptz'))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('events').execute()
}
