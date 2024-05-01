import { Kysely } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export function up(db: Kysely<unknown>) {
  return createStandardTable(db, 'health_worker_google_tokens', (qb) =>
    qb
      .addColumn(
        'health_worker_id',
        'uuid',
        (col) =>
          col.notNull().references('health_workers.id').onDelete('cascade'),
      )
      .addColumn('access_token', 'text', (col) => col.notNull())
      .addColumn('refresh_token', 'varchar(255)', (col) => col.notNull())
      .addColumn('expires_at', 'timestamptz', (col) => col.notNull())
      .addUniqueConstraint('google_tokens_health_worker_id', [
        'health_worker_id',
      ])
      .addUniqueConstraint('google_tokens_access_token', ['access_token'])
      .addUniqueConstraint('google_tokens_refresh_token', ['refresh_token']))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('health_worker_google_tokens').execute()
}
