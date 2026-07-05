import { Kysely } from 'kysely'
import type { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await db.schema.alterTable('health_worker_web_notifications')
    .addColumn('originator_health_worker_id', 'uuid', (col) => col.references('health_workers.id').onDelete('cascade'))
    .execute()

  await db.schema
    .createIndex('idx_health_worker_web_notifications_originator_health_worker_id')
    .on('health_worker_web_notifications')
    .column('originator_health_worker_id')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.alterTable('health_worker_web_notifications').dropColumn('originator_health_worker_id').execute()
}
