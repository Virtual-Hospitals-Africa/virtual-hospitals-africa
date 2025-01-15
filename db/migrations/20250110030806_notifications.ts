import { Kysely } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export function up(db: Kysely<unknown>) {
  return createStandardTable(
    db,
    'health_worker_web_notifications',
    (qb) =>
      qb
        .addColumn('health_worker_id', 'uuid', (col) =>
          col.notNull().references('health_workers.id'))
        .addColumn('table_name', 'uuid', (col) =>
          col.notNull())
        .addColumn('row_id', 'uuid', (col) =>
          col.notNull())
        .addColumn('notification_type', 'varchar(255)', (col) => col.notNull())
        .addColumn('title', 'text', (col) => col.notNull())
        .addColumn('description', 'text', (col) => col.notNull())
        .addColumn('avatar_url', 'text', (col) => col.notNull())
        .addColumn('action_title', 'text', (col) => col.notNull())
        .addColumn('action_href', 'text', (col) => col.notNull())
        .addColumn('seen_at', 'timestamptz'),
  )
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('health_worker_web_notifications').execute()
}
