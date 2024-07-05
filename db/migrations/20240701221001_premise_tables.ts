import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createType('premises_types')
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

  await createStandardTable(db, 'premises', (qb) =>
    qb
      .addColumn('licence_number', 'varchar(255)', (col) => col.notNull())
      .addColumn('name', 'varchar(255)', (col) => col.notNull())
      .addColumn('licensee', 'varchar(255)', (col) => col.notNull())
      .addColumn('address', 'varchar(255)')
      .addColumn('town', 'varchar(255)')
      .addColumn('expiry_date', 'date', (col) => col.notNull())
      .addColumn('premises_types', sql`premises_types`, (col) => col.notNull()))

  await createStandardTable(db, 'premise_supervisors', (qb) =>
    qb
      .addColumn('prefix', sql`name_prefix`)
      .addColumn('given_name', 'varchar(255)', (col) => col.notNull())
      .addColumn('family_name', 'varchar(255)', (col) => col.notNull())
      .addColumn('premise_id', 'uuid', (col) =>
        col.notNull().references('premises.id').onDelete('cascade'))
      .addColumn(
        'pharmacist_id',
        'uuid',
        (col) =>
          col.notNull().references('pharmacists.id').onDelete('cascade'),
      ))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('premise_supervisors').execute()
  await db.schema.dropTable('premises').execute()

  await db.schema.dropType('premises_types').execute()
}
