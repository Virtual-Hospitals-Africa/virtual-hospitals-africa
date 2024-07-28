import { Kysely } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await createStandardTable(
    db,
    'health_workers',
    (qb) =>
      qb.addColumn('name', 'varchar(255)', (col) => col.notNull())
        .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
        .addColumn('avatar_url', 'text', (col) => col.notNull()),
  )

  await createStandardTable(db, 'health_worker_google_tokens', (qb) =>
    qb
      .addColumn(
        'health_worker_id',
        'uuid',
        (col) =>
          col.notNull().unique().references('health_workers.id').onDelete(
            'cascade',
          ),
      )
      .addColumn('access_token', 'text', (col) => col.notNull().unique())
      .addColumn(
        'refresh_token',
        'varchar(255)',
        (col) => col.notNull().unique(),
      )
      .addColumn('expires_at', 'timestamptz', (col) => col.notNull()))

  await createStandardTable(db, 'health_worker_sessions', (qb) =>
    qb
      .addColumn(
        'entity_id',
        'uuid',
        (col) =>
          col.notNull().references('health_workers.id').onDelete('cascade'),
      ))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('health_worker_sessions').execute()
  await db.schema.dropTable('health_worker_google_tokens').execute()
  await db.schema.dropTable('health_workers').execute()
}
