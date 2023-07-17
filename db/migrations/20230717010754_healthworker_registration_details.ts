import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

export async function up(db: Kysely<unknown>) {
  await db
    .schema
    .createType('nurse_speciality')
    .asEnum([
      'primary_care_nurse',
      'registered_general_nurse',
      'midwife',
      'intensive_and_coronary_care_nurse',
      'renal_nurse',
      'neonatal_intensive_care_and_paediatric_nurse',
      'psychiatric_mental_health_nurse',
      'operating_theatre_nurse',
      'community_nurse',
      'opthalmic_nurse',
      'nurse_administrator',
      'nurse_anaesthetist',
      'trauma_care_nurse',
      'clinical_care_nurse',
      'clinical_officer',
      'orthopaedic_nurse',
      'oncology_and_palliative_care_nurse',
      'dental_nurse',
    ])
    .execute()

  await db
    .schema
    .createTable('nurse_specialities')
    .addColumn('id', 'serial', (column) => column.primaryKey())
    .addColumn(
      'created_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn('employee_id', 'integer', (column) =>
      column
        .notNull()
        .references('employment.id')
        .onDelete('cascade'))
    .addColumn(
      'speciality',
      sql`nurse_speciality`,
      (column) => column.notNull(),
    )
    .addUniqueConstraint('one_unique_speciality_per_employee', [
      'employee_id',
      'speciality',
    ])
    .execute()

  await db
    .schema
    .createTable('nurse_registration_details')
    .addColumn('id', 'serial', (column) => column.primaryKey())
    .addColumn(
      'created_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn('health_worker_id', 'integer', (column) =>
      column
        .references('health_workers.id')
        .onDelete('cascade')
        .notNull()
        .unique())
    .addColumn('gender', sql`gender`, (column) => column.notNull())
    .addColumn('national_id', 'varchar(255)', (column) =>
      column
        .notNull()
        .check(sql`national_id ~ '^[0-9]{8}[a-zA-Z]{1}[0-9]{2}$'`))
    .addColumn('date_of_first_practice', 'date', (column) => column.notNull())
    .addColumn('ncz_registration_number', 'varchar(255)', (column) =>
      column
        .notNull()
        .check(sql`ncz_registration_number ~ '^[a-zA-Z]{2}[0-9]{6}$'`))
    .addColumn('mobile_number', 'varchar(255)', (column) => column.notNull())
    .addColumn('national_id_media_id', 'integer', (column) =>
      column
        .references('media.id')
        .onDelete('set null'))
    .addColumn('ncz_registration_card_media_id', 'integer', (column) =>
      column
        .references('media.id')
        .onDelete('set null'))
    .addColumn('face_picture_media_id', 'integer', (column) =>
      column
        .references('media.id')
        .onDelete('set null'))
    .execute()

  await addUpdatedAtTrigger(db, 'nurse_registration_details')
  await addUpdatedAtTrigger(db, 'nurse_specialities')
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('nurse_registration_details').execute()
  await db.schema.dropTable('nurse_specialities').execute()
  await db.schema.dropType('nurse_speciality').execute()
}
