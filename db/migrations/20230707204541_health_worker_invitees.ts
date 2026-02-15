import type { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export function up(db: Kysely<DB>) {
  return createStandardTable(
    db,
    'health_worker_invitees',
    (qb) =>
      qb.addColumn('email', 'varchar(255)', (col) => col.notNull())
        .addColumn('organization_id', 'uuid', (col) =>
          col.notNull()
            .references('organizations.id')
            .onDelete('cascade'))
        .addColumn(
          'profession',
          sql`profession`,
        )
        .addColumn(
          'is_admin',
          'boolean',
          (col) => col.notNull(),
        )
        .addUniqueConstraint('only_invited_once_per_organization', [
          'email',
          'organization_id',
        ]).addCheckConstraint(
          'only_admins_can_be_invited_in_another_profession',
          sql`
          (profession IS NOT NULL) OR (is_admin = TRUE)
        `,
        ),
  ).then(async () => {
    await db.schema
      .createIndex('idx_health_worker_invitees_organization_id')
      .on('health_worker_invitees')
      .column('organization_id')
      .execute()
  })
}

export async function down(db: Kysely<DB>) {
  await db.schema
    .dropTable('health_worker_invitees').execute()
}
