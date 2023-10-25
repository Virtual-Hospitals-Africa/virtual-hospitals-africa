import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .alterTable('patients')
    .addCheckConstraint(
      'patient_national_id_number_format',
      sql`national_id_number IS NULL OR national_id_number ~ '^[0-9]{2}-[0-9]{6,7} [A-Z] [0-9]{2}$'`,
    )
    .execute()

  await db.schema
    .alterTable('nurse_registration_details')
    .dropConstraint('nurse_registration_details_national_id_check')
    .execute()

  await db.schema
    .alterTable('nurse_registration_details')
    .renameColumn('national_id', 'national_id_number')
    .execute()

  await db.schema
    .alterTable('nurse_registration_details')
    .addCheckConstraint(
      'nurse_registration_details_national_id_number_check',
      sql`national_id_number ~ '^[0-9]{2}-[0-9]{6,7} [A-Z] [0-9]{2}$'`,
    )
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema
    .alterTable('nurse_registration_details')
    .dropConstraint('nurse_registration_details_national_id_number_check')
    .execute()

  await db.schema
    .alterTable('nurse_registration_details')
    .renameColumn('national_id_number', 'national_id')
    .execute()

  await db.schema
    .alterTable('nurse_registration_details')
    .addCheckConstraint(
      'nurse_registration_details_national_id_check',
      sql`national_id ~ '^[0-9]{8}[a-zA-Z]{1}[0-9]{2}$'`,
    )
    .execute()

  await db.schema
    .alterTable('patients')
    .dropConstraint('patient_national_id_number_format')
    .execute()
}
