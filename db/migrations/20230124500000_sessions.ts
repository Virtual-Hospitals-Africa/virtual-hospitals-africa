import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema.createType('entity_type').asEnum([
    'health_worker',
    'regulator',
  ]).execute()
  await createStandardTable(db, 'google_tokens', (qb) =>
    qb
      .addColumn(
        'entity_id',
        'uuid',
        (col) => col.notNull().unique(),
      )
      .addColumn('entity_type', sql`entity_type`, (col) => col.notNull())
      .addColumn('access_token', 'text', (col) => col.notNull().unique())
      .addColumn(
        'refresh_token',
        'varchar(255)',
        (col) => col.notNull().unique(),
      )
      .addColumn('expires_at', 'timestamptz', (col) => col.notNull()))

  await createStandardTable(db, 'sessions', (qb) =>
    qb
      .addColumn(
        'entity_id',
        'uuid',
        (col) => col.notNull(),
      )
      .addColumn('entity_type', sql`entity_type`, (col) => col.notNull()))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('sessions').execute()
  await db.schema.dropTable('google_tokens').execute()
}
