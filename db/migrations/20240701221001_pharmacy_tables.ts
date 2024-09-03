import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createType('pharmacies_types')
    .asEnum([
      'Clinics: Class A',
      'Clinics: Class B',
      'Clinics: Class C',
      'Clinics: Class D',
      'Dispensing medical practice',
      'Hospital pharmacies',
      'Pharmacy in any other location',
      'Pharmacy in rural area',
      'Pharmacies: Restricted',
      'Pharmacies: Research',
      'Pharmacy located in the CBD',
      'Wholesalers',
    ])
    .execute()

  await createStandardTable(db, 'pharmacies', (qb) =>
    qb
      .addColumn('licence_number', 'varchar(255)', (col) => col.notNull())
      .addColumn('name', 'varchar(255)', (col) => col.notNull())
      .addColumn('licensee', 'varchar(255)', (col) => col.notNull())
      .addColumn('address', 'varchar(255)')
      .addColumn('town', 'varchar(255)')
      .addColumn('expiry_date', 'date', (col) => col.notNull())
      .addColumn('pharmacies_types', sql`pharmacies_types`, (col) =>
        col.notNull()))

  await createStandardTable(db, 'pharmacy_employment', (qb) =>
    qb
      .addColumn('pharmacy_id', 'uuid', (col) =>
        col.notNull().references('pharmacies.id').onDelete('cascade'))
      .addColumn('pharmacist_id', 'uuid', (col) =>
        col.notNull().references('pharmacists.id').onDelete('cascade'))
      .addColumn('is_supervisor', 'boolean', (col) =>
        col.notNull()))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('pharmacy_employment').execute()
  await db.schema.dropTable('pharmacies').execute()

  await db.schema.dropType('pharmacies_types').execute()
}
