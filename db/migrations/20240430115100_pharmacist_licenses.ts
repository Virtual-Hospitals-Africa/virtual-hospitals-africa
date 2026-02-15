import { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createTable.ts'
import { now } from '../helpers.ts'

export async function up(db: Kysely<DB>) {
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

  await createStandardTable(db, 'pharmacist_licences', (qb) =>
    qb
      .addColumn('pharmacist_id', 'uuid', (col) => col.notNull().references('pharmacists.id').onDelete('cascade'))
      .addColumn('licence_number', 'varchar(255)', (col) => col.notNull())
      .addColumn('prefix', sql`name_prefix`)
      .addColumn('given_name', 'varchar(255)', (col) => col.notNull())
      .addColumn('family_name', 'varchar(255)', (col) => col.notNull())
      .addColumn('address', 'varchar(255)')
      .addColumn('town', 'varchar(255)')
      .addColumn('expiry_date', 'date', (col) => col.notNull())
      .addColumn(
        'pharmacist_type',
        sql`pharmacist_type`,
        (col) => col.notNull(),
      )
      .addColumn(
        'country',
        'varchar(2)',
        (col) => col.notNull().references('countries.iso_3166_2').onDelete('cascade'),
      ))

  await createStandardTable(db, 'pharmacist_licence_revocations', (qb) =>
    qb
      .addColumn('pharmacist_license_id', 'uuid', (col) => col.notNull().references('pharmacist_licences.id').onDelete('cascade'))
      .addColumn('revoked_at', 'timestamp', (col) => col.notNull().defaultTo(now))
      .addColumn(
        'revoked_by',
        'uuid',
        (col) => col.notNull().references('regulators.id').onDelete('cascade'),
      ))

  await db.schema
    .createIndex('idx_pharmacist_licences_country')
    .on('pharmacist_licences')
    .column('country')
    .execute()

  await db.schema
    .createIndex('idx_pharmacist_licence_revocations_revoked_by')
    .on('pharmacist_licence_revocations')
    .column('revoked_by')
    .execute()

  await db.schema
    .createIndex('idx_pharmacist_licences_pharmacist_id')
    .on('pharmacist_licences')
    .column('pharmacist_id')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('pharmacist_licence_revocations').execute()
  await db.schema.dropTable('pharmacist_licences').execute()
  await db.schema.dropType('pharmacist_type').execute()
  await db.schema.dropType('name_prefix').execute()
}
