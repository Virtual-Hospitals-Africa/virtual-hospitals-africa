import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await createStandardTable(db, 'patient_symptoms', (qb) =>
    qb.addColumn(
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
          col.notNull().references('icd10_diagnoses.code').onDelete('cascade'),
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
      ))

  await createStandardTable(db, 'patient_symptom_media', (qb) =>
    qb.addColumn(
      'patient_symptom_id',
      'integer',
      (col) =>
        col.notNull().references('patient_symptoms.id').onDelete('cascade'),
    )
      .addColumn(
        'media_id',
        'integer',
        (col) => col.notNull().references('media.id').onDelete('cascade'),
      ))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_symptom_media').execute()
  await db.schema.dropTable('patient_symptoms').execute()
}
