import { Kysely } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await createStandardTable(
    db,
    'regulators',
    (qb) =>
      qb.addColumn('name', 'varchar(255)', (col) => col.notNull())
        .addColumn('email', 'varchar(255)', (col) => col.notNull().unique())
        .addColumn('avatar_url', 'text'),
  )

  await createStandardTable(db, 'regulator_google_tokens', (qb) =>
    qb
      .addColumn(
        'regulator_id',
        'uuid',
        (col) =>
          col.notNull().unique().references('regulators.id').onDelete(
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

  await createStandardTable(db, 'regulator_sessions', (qb) =>
    qb
      .addColumn(
        'entity_id',
        'uuid',
        (col) => col.notNull().references('regulators.id').onDelete('cascade'),
      ))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('regulator_sessions').execute()
  await db.schema.dropTable('regulator_google_tokens').execute()
  await db.schema.dropTable('regulators').execute()
}
