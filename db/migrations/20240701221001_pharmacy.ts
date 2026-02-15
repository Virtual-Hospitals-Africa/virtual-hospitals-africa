import { DB } from '../../db.d.ts'
import { Kysely } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(
    db,
    'pharmacy_licences',
    (qb) =>
      qb.addColumn('organization_id', 'uuid', (col) => col.notNull().references('organizations.id').onDelete('cascade'))
        .addColumn('licensee_id', 'uuid', (col) => col.notNull().references('pharmacist_licences.id').onDelete('cascade'))
        .addColumn('expiry_date', 'date'),
  )
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('pharmacy_employment').execute()
  await db.schema.alterTable('organizations').dropColumn('expiry_date').execute()
  await db.schema.alterTable('organizations').dropColumn('licensee').execute()
  await db.schema.alterTable('organizations').dropColumn('licence_number').execute()
}
