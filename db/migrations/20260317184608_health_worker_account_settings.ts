import { Kysely } from 'kysely'
import type { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await db.schema
    .alterTable('health_worker_accounts')
    .addColumn('settings', 'jsonb')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema
    .alterTable('health_worker_accounts')
    .dropColumn('settings')
    .execute()
}
