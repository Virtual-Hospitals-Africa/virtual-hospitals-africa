import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

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

  return createStandardTable(db, 'pharmacists', (qb) =>
    qb
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
      ).addColumn('revoked_at', 'timestamp')
      .addColumn(
        'revoked_by',
        'integer', /*, col => col.references('regulators.id')*/
      )
      .addCheckConstraint(
        'revoked_at',
        sql`(revoked_at is null) = (revoked_by is null)`,
      ))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('pharmacists').execute()
  await db.schema.dropType('pharmacist_type').execute()
  await db.schema.dropType('name_prefix').execute()
}
