import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema.createTable('health_worker_google_tokens')
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
    .addColumn(
      'health_worker_id',
      'integer',
      (col) =>
        col.notNull().references('health_workers.id').onDelete('cascade'),
    )
    .addColumn('access_token', 'text', (col) => col.notNull())
    .addColumn('refresh_token', 'varchar(255)', (col) => col.notNull())
    .addColumn('expires_at', 'timestamptz', (col) => col.notNull())
    .addUniqueConstraint('google_tokens_health_worker_id', ['health_worker_id'])
    .addUniqueConstraint('google_tokens_access_token', ['access_token'])
    .addUniqueConstraint('google_tokens_refresh_token', ['refresh_token'])
    .execute()

  await addUpdatedAtTrigger(db, 'health_worker_google_tokens')
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('health_worker_google_tokens').execute()
}
