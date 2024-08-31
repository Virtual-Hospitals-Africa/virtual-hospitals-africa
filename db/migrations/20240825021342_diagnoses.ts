import { Kysely } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await createStandardTable(db, 'diagnoses', (qb) =>
    qb
      .addColumn(
        'patient_condition_id',
        'uuid',
        (col) =>
          col.notNull().references('patient_conditions.id').onDelete('cascade'),
      )
      .addColumn(
        'provider_id',
        'uuid',
        (col) => col.notNull().references('employment.id').onDelete('cascade'),
      )
      .addColumn(
        'doctor_review_id',
        'uuid',
        (col) =>
          col.notNull().references('doctor_reviews.id').onDelete('cascade'),
      ))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('diagnoses').execute()
}
