import { Kysely } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export function up(db: Kysely<unknown>) {
  return createStandardTable(
    db,
    'health_worker_messages',
    (qb) =>
      qb
        .addColumn('health_worker_id', 'uuid', (col) =>
          col.notNull().references('health_workers.id'))
        .addColumn('message', 'text', (col) =>
          col.notNull()),
  )
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('health_worker_messages').execute()
}
