import { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
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
      .addColumn(
        'country',
        'varchar(2)',
        (col) => col.notNull().references('countries.iso_3166_2').onDelete('cascade'),
      )
      .addColumn('licence_number', 'varchar(255)', (col) => col.notNull())
      .addColumn('name', 'varchar(255)', (col) => col.notNull())
      .addColumn('licensee', 'varchar(255)', (col) => col.notNull())
      .addColumn('address', 'varchar(255)')
      .addColumn('town', 'varchar(255)')
      .addColumn('expiry_date', 'date', (col) => col.notNull())
      .addColumn('pharmacies_types', sql`pharmacies_types`, (col) => col.notNull()))

  await createStandardTable(db, 'pharmacy_employment', (qb) =>
    qb
      .addColumn('pharmacy_id', 'uuid', (col) => col.notNull().references('pharmacies.id').onDelete('cascade'))
      .addColumn('pharmacist_id', 'uuid', (col) => col.notNull().references('pharmacists.id').onDelete('cascade'))
      .addColumn('is_supervisor', 'boolean', (col) => col.notNull()))

  await db.schema
    .createIndex('idx_pharmacies_country')
    .on('pharmacies')
    .column('country')
    .execute()

  await db.schema
    .createIndex('idx_pharmacy_employment_pharmacy_id')
    .on('pharmacy_employment')
    .column('pharmacy_id')
    .execute()

  await db.schema
    .createIndex('idx_pharmacy_employment_pharmacist_id')
    .on('pharmacy_employment')
    .column('pharmacist_id')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('pharmacy_employment').execute()
  await db.schema.dropTable('pharmacies').execute()

  await db.schema.dropType('pharmacies_types').execute()
}
