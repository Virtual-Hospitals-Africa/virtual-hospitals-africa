import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

// deno-lint-ignore no-explicit-any
export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('patient_symptoms')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'created_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'patient_id',
      'integer',
      (col) => col.notNull().references('patients.id').onDelete('cascade'),
    )
    .addColumn(
      'encounter_id',
      'integer',
      (col) =>
        col.notNull().references('patient_encounters.id').onDelete('cascade'),
    )
    .addColumn(
      'encounter_provider_id',
      'integer',
      (col) =>
        col.notNull().references('patient_encounter_providers.id').onDelete(
          'cascade',
        ),
    )
    .addColumn(
      'code',
      'varchar(8)',
      (col) =>
        col.notNull().references('icd10_diagnosis.code').onDelete('cascade'),
    )
    .addColumn(
      'severity',
      'int4',
      (col) => col.notNull().check(sql`severity > 0 AND severity <= 10`),
    )
    .addColumn('start_date', 'date', (col) => col.notNull())
    .addColumn('end_date', 'date')
    .addColumn('notes', 'text')
    .addCheckConstraint(
      'symptom_starts_before_today',
      sql`
      start_date <= TO_CHAR(CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Johannesburg', 'YYYY-MM-DD')::date
    `,
    )
    .addCheckConstraint(
      'symptom_date_range',
      sql`
        end_date IS NULL OR (
          end_date >= start_date AND
          end_date <= TO_CHAR(CURRENT_TIMESTAMP AT TIME ZONE 'Africa/Johannesburg', 'YYYY-MM-DD')::date
        )
      `,
    )
    .execute()

  await db.schema.createTable('patient_symptom_media')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'created_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'patient_symptom_id',
      'integer',
      (col) =>
        col.notNull().references('patient_symptoms.id').onDelete('cascade'),
    )
    .addColumn(
      'media_id',
      'integer',
      (col) => col.notNull().references('media.id').onDelete('cascade'),
    )
    .execute()

  await addUpdatedAtTrigger(db, 'patient_symptoms')
  await addUpdatedAtTrigger(db, 'patient_symptom_media')
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_symptom_media').execute()
  await db.schema.dropTable('patient_symptoms').execute()
}
