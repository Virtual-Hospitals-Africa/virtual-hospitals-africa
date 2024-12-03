import { Kysely } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export function up(db: Kysely<unknown>) {
  return createStandardTable(db, 'events', (qb) =>
    qb
      .addColumn('type', 'varchar(255)', (col) => col.notNull())
      .addColumn('data', 'jsonb', (column) => column.notNull())
      .addColumn('error_message', 'text')
      .addColumn('backoff_until', 'timestamptz')
      .addColumn(
        'processed_at',
        'timestamptz',
      ))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('event').execute()
}
