import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await db.schema.createType('name_prefix')
    .asEnum([
      'Mr',
      'Mrs',
      'Ms',
      'Dr',
      'Miss',
      'Sr',
    ])
    .execute()

  await db.schema.createType('pharmacist_type')
    .asEnum([
      'Dispensing Medical Practitioner',
      'Ind Clinic Nurse',
      'Pharmacist',
      'Pharmacy Technician',
    ])
    .execute()

  await db.schema
    .alterTable('pharmacists')
    .dropColumn('registration_number')
    .dropColumn('id_number')
    .dropColumn('name')
    .addColumn('licence_number', 'varchar(255)', (col) => col.notNull())
    .addColumn('prefix', sql`name_prefix`)
    .addColumn('given_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('family_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('address', 'varchar(255)')
    .addColumn('town', 'varchar(255)')
    .addColumn('expiry_date', 'date', (col) => col.notNull())
    .addColumn('pharmacist_type', sql`pharmacist_type`, (col) => col.notNull())
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema
    .alterTable('pharmacists')
    .addColumn('registration_number', 'varchar(255)')
    .addColumn('id_number', 'varchar(255)')
    .addColumn('name', 'varchar(255)')
    .dropColumn('licence_number')
    .dropColumn('prefix')
    .dropColumn('given_name')
    .dropColumn('family_name')
    .dropColumn('address')
    .dropColumn('town')
    .dropColumn('expiry_date')
    .dropColumn('pharmacist_type')
    .execute()

  await db.schema.dropType('pharmacist_type').execute()
  await db.schema.dropType('name_prefix').execute()
}
