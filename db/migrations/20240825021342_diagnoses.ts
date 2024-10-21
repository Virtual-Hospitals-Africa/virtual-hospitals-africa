import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await createStandardTable(db, 'diagnoses', (qb) =>
    qb
      .addColumn('patient_condition_id', 'uuid', (col) =>
        col.notNull().references('patient_conditions.id').onDelete('cascade'))
      .addColumn('provider_id', 'uuid', (col) =>
        col.notNull().references('employment.id').onDelete('cascade'))
      .addColumn('doctor_review_id', 'uuid', (col) =>
        col.notNull().references('doctor_reviews.id').onDelete('cascade'))
      .addColumn('patient_encounter_id', 'uuid', (col) =>
        col.references('patient_encounters.id').onDelete('cascade'))
      .addCheckConstraint(
        'either_doctor_review_or_patient_encounter',
        sql<
          boolean
        >`("doctor_review_id" IS NOT NULL) = ("patient_encounter_id" IS NULL)`,
      ))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('diagnoses').execute()
}
