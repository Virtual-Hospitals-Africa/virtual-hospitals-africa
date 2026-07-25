import type { DB } from '../../db.d.ts'
import { Kysely } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(
    db,
    'insurance_network_membership',
    (qb) =>
      qb
        .addColumn('insurance_network_id', 'uuid', (col) =>
          col.notNull().references('insurance_network.id').onDelete('cascade')
        )
        .addColumn('health_worker_id', 'uuid', (col) =>
          col.notNull().references('health_workers.id').onDelete('cascade')
        )
        .addColumn('member_since', 'date', (col) => col.notNull())
        .addColumn('member_until', 'date')
        .addColumn('inactive_reason', 'varchar(255)')
        .addColumn('provider_id', 'varchar(100)')
        .addColumn('membership_tier', 'varchar(100)')
        .addUniqueConstraint('unique_health_worker_insurance_network', [
          'health_worker_id',
          'insurance_network_id',
        ])
  )

  await db.schema
    .createIndex('idx_insurance_network_membership_health_worker_id')
    .on('insurance_network_membership')
    .column('health_worker_id')
    .execute()

  await db.schema
    .createIndex('idx_insurance_network_membership_insurance_network_id')
    .on('insurance_network_membership')
    .column('insurance_network_id')
    .execute()

}

// deno-lint-ignore no-explicit-any
export async function down(db: Kysely<any>) {
  await db.schema.dropTable('insurance_network_membership').execute()
}
