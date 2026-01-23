import { DB } from '../../db.d.ts'
import { Kysely } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export function up(db: Kysely<DB>) {
  return createStandardTable(
    db,
    'health_worker_web_notifications',
    (qb) =>
      qb
        .addColumn('health_worker_id', 'uuid', (col) => col.notNull().references('health_workers.id'))
        .addColumn('table_name', 'varchar(255)', (col) => col.notNull())
        .addColumn('row_id', 'uuid', (col) => col.notNull())
        .addColumn('notification_type', 'varchar(255)', (col) => col.notNull())
        .addColumn('title', 'text', (col) => col.notNull())
        .addColumn('description', 'text', (col) => col.notNull())
        .addColumn('avatar_url', 'text', (col) => col.notNull())
        .addColumn('action_title', 'text', (col) => col.notNull())
        .addColumn('action_href', 'text', (col) => col.notNull())
        .addColumn('seen_at', 'timestamptz'),
  ).then(async () => {
    await db.schema
      .createIndex('idx_health_worker_web_notifications_health_worker_id')
      .on('health_worker_web_notifications')
      .column('health_worker_id')
      .execute()
  })
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('health_worker_web_notifications').execute()
}
