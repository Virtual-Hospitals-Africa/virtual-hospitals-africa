import { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(db, 'diagnoses', (qb) =>
    qb
      .addColumn('patient_condition_id', 'uuid', (col) => col.notNull().references('patient_conditions.id').onDelete('cascade'))
      .addColumn('provider_id', 'uuid', (col) => col.notNull().references('employment.id').onDelete('cascade'))
      .addColumn('doctor_review_id', 'uuid', (col) => col.references('doctor_reviews.id').onDelete('cascade'))
      .addColumn('patient_encounter_id', 'uuid', (col) => col.references('patient_encounters.id').onDelete('cascade'))
      .addCheckConstraint(
        'either_doctor_review_or_patient_encounter',
        sql<
          boolean
        >`("doctor_review_id" IS NOT NULL) = ("patient_encounter_id" IS NULL)`,
      ))

  await db.schema
    .createIndex('idx_diagnoses_patient_condition_id')
    .on('diagnoses')
    .column('patient_condition_id')
    .execute()

  await db.schema
    .createIndex('idx_diagnoses_provider_id')
    .on('diagnoses')
    .column('provider_id')
    .execute()

  await db.schema
    .createIndex('idx_diagnoses_doctor_review_id')
    .on('diagnoses')
    .column('doctor_review_id')
    .execute()

  await db.schema
    .createIndex('idx_diagnoses_patient_encounter_id')
    .on('diagnoses')
    .column('patient_encounter_id')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('diagnoses').execute()
}
