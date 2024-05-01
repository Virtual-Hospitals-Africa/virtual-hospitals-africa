import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export function up(db: Kysely<unknown>) {
  return createStandardTable(
    db,
    'health_worker_invitees',
    (qb) =>
      qb.addColumn('email', 'varchar(255)', (col) => col.notNull())
        .addColumn('organization_id', 'uuid', (col) =>
          col.notNull()
            .references('Organization.id')
            .onDelete('cascade'))
        .addColumn(
          'profession',
          sql`profession`,
          (col) => col.notNull(),
        )
        .addUniqueConstraint('only_invited_once_per_profession', [
          'email',
          'organization_id',
          'profession',
        ]),
  )
}

export async function down(db: Kysely<unknown>) {
  await db.schema
    .dropTable('health_worker_invitees').execute()
}
