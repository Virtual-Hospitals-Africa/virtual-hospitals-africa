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
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('health_workers').execute()
}
