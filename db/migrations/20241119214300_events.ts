import { Kysely } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export function up(db: Kysely<unknown>) {
  return createStandardTable(db, 'events', (qb) =>
    qb
      .addColumn('type', 'varchar(255)', (col) => col.notNull())
      .addColumn('data', 'jsonb', (column) => column.notNull())
      .addColumn('error_message', 'text')
      .addColumn('retry_count', 'integer', (col) => col.notNull().defaultTo(0))
      .addColumn('backoff_until', 'timestamptz')
      .addColumn('processed_at', 'timestamptz'))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('events').execute()
}
