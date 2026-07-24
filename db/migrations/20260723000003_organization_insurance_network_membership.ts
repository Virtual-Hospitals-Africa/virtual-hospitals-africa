import type { DB } from '../../db.d.ts'
import { Kysely } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(
    db,
    'organization_insurance_network_membership',
    (qb) =>
      qb
        .addColumn('organization_id', 'uuid', (col) =>
          col.notNull().references('organizations.id').onDelete('cascade')
        )
        .addColumn('insurance_network_id', 'uuid', (col) =>
          col.notNull().references('insurance_network.id').onDelete('cascade')
        )
        .addColumn('contract_start_date', 'date', (col) => col.notNull())
        .addColumn('contract_end_date', 'date')
        .addColumn('is_active', 'boolean', (col) => col.notNull().defaultTo(true))
        .addColumn('contract_terms', 'text')
        .addUniqueConstraint('unique_organization_insurance_network', [
          'organization_id',
          'insurance_network_id',
        ])
  )

  await db.schema
    .createIndex('idx_organization_insurance_network_membership_organization_id')
    .on('organization_insurance_network_membership')
    .column('organization_id')
    .execute()

  await db.schema
    .createIndex('idx_organization_insurance_network_membership_insurance_network_id')
    .on('organization_insurance_network_membership')
    .column('insurance_network_id')
    .execute()

  await db.schema
    .createIndex('idx_organization_insurance_network_membership_is_active')
    .on('organization_insurance_network_membership')
    .column('is_active')
    .execute()

  await db.schema
    .createIndex('idx_organization_insurance_network_membership_org_active')
    .on('organization_insurance_network_membership')
    .columns(['organization_id', 'is_active'])
    .execute()
}

// deno-lint-ignore no-explicit-any
export async function down(db: Kysely<any>) {
  await db.schema.dropTable('organization_insurance_network_membership').execute()
}
