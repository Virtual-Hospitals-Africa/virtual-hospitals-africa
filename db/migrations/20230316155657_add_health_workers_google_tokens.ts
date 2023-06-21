import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await db.schema.createTable('health_worker_google_tokens')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'created_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'health_worker_id',
      'integer',
      (col) =>
        col.notNull().references('health_workers.id').onDelete('cascade'),
    )
    .addColumn('access_token', 'varchar(255)', (col) => col.notNull())
    .addColumn('refresh_token', 'varchar(255)', (col) => col.notNull())
    .addColumn('expires_at', 'timestamp', (col) => col.notNull())
    .addUniqueConstraint('health_worker_id', ['health_worker_id'])
    .addUniqueConstraint('access_token', ['access_token'])
    .addUniqueConstraint('refresh_token', ['refresh_token'])
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('health_worker_google_tokens').execute()
}
