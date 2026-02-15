import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createTable.ts'
import { DOCTOR_REVIEW_STEPS } from '../../shared/review.ts'
import type { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await db.schema.createType('doctor_review_step')
    .asEnum(DOCTOR_REVIEW_STEPS)
    .execute()

  await db.schema.createTable('doctor_review')
    .addColumn('step', sql`doctor_review_step`, (col) => col.primaryKey())
    .addColumn('order', 'int8', (col) => col.notNull().unique())
    .execute()

  await db.insertInto('doctor_review')
    .values(DOCTOR_REVIEW_STEPS.map((step, i) => ({ step, order: i + 1 })))
    .execute()

  await createStandardTable(db, 'doctor_review_requests', (qb) =>
    qb
      .addColumn('patient_id', 'uuid', (col) =>
        col
          .notNull()
          .references('patients.id')
          .onDelete('cascade'))
      .addColumn('patient_encounter_id', 'uuid', (col) =>
        col
          .notNull()
          .references('patient_encounters.id')
          .onDelete('cascade'))
      .addColumn('requested_by', 'uuid', (col) =>
        col
          .notNull()
          .references('patient_encounter_employees.id')
          .onDelete('cascade'))
      .addColumn('organization_id', 'uuid', (col) =>
        col
          .references('organizations.id')
          .onDelete('cascade'))
      .addColumn('doctor_id', 'uuid', (col) =>
        col
          .references('doctors.id')
          .onDelete('cascade'))
      .addColumn('requester_notes', 'text')
      .addUniqueConstraint('once_per_patient_organization', [
        'patient_id',
        'organization_id',
      ])
      .addUniqueConstraint('once_per_patient_employee', [
        'patient_id',
        'doctor_id',
      ])
      .addCheckConstraint(
        'organization_or_requesting_employee',
        sql`
        (organization_id is not null and doctor_id is null) or
        (organization_id is null and doctor_id is not null)
      `,
      ))

  await createStandardTable(db, 'doctor_reviews', (qb) =>
    qb
      .addColumn('reviewer_id', 'uuid', (col) =>
        col
          .notNull()
          .references('employment.id')
          .onDelete('cascade'))
      .addColumn('patient_id', 'uuid', (col) =>
        col
          .notNull()
          .references('patients.id')
          .onDelete('cascade'))
      .addColumn('patient_encounter_id', 'uuid', (col) =>
        col
          .notNull()
          .references('patient_encounters.id')
          .onDelete('cascade'))
      .addColumn('requested_by', 'uuid', (col) =>
        col
          .notNull()
          .references('patient_encounter_employees.id')
          .onDelete('cascade'))
      .addColumn('requester_notes', 'text')
      .addColumn('reviewer_notes', 'text')
      .addColumn('completed_at', 'timestamptz')
      .addUniqueConstraint('reviewed_once', [
        'patient_encounter_id',
        'reviewer_id',
      ])
      .addUniqueConstraint('once_per_patient', [
        'patient_id',
        'completed_at',
      ], (constraint) => constraint.nullsNotDistinct()))

  await createStandardTable(db, 'doctor_review_steps', (qb) =>
    qb.addColumn(
      'doctor_review_id',
      'uuid',
      (col) =>
        col.notNull().references('doctor_reviews.id').onDelete(
          'cascade',
        ),
    )
      .addColumn(
        'step',
        sql`doctor_review_step`,
        (col) => col.notNull().references('doctor_review.step'),
      )
      .addUniqueConstraint('doctor_review_step_once', [
        'doctor_review_id',
        'step',
      ]))

  await db.schema
    .createIndex('idx_doctor_review_requests_patient_id')
    .on('doctor_review_requests')
    .column('patient_id')
    .execute()

  await db.schema
    .createIndex('idx_doctor_review_requests_patient_encounter_id')
    .on('doctor_review_requests')
    .column('patient_encounter_id')
    .execute()

  await db.schema
    .createIndex('idx_doctor_review_requests_requested_by')
    .on('doctor_review_requests')
    .column('requested_by')
    .execute()

  await db.schema
    .createIndex('idx_doctor_review_requests_organization_id')
    .on('doctor_review_requests')
    .column('organization_id')
    .execute()

  await db.schema
    .createIndex('idx_doctor_review_requests_doctor_id')
    .on('doctor_review_requests')
    .column('doctor_id')
    .execute()

  await db.schema
    .createIndex('idx_doctor_reviews_reviewer_id')
    .on('doctor_reviews')
    .column('reviewer_id')
    .execute()

  await db.schema
    .createIndex('idx_doctor_reviews_patient_id')
    .on('doctor_reviews')
    .column('patient_id')
    .execute()

  await db.schema
    .createIndex('idx_doctor_reviews_patient_encounter_id')
    .on('doctor_reviews')
    .column('patient_encounter_id')
    .execute()

  await db.schema
    .createIndex('idx_doctor_reviews_requested_by')
    .on('doctor_reviews')
    .column('requested_by')
    .execute()

  await db.schema
    .createIndex('idx_doctor_reviews_completed_at')
    .on('doctor_reviews')
    .column('completed_at')
    .execute()

  await db.schema
    .createIndex('idx_doctor_review_steps_doctor_review_id')
    .on('doctor_review_steps')
    .column('doctor_review_id')
    .execute()

  await db.schema
    .createIndex('idx_doctor_review_steps_step')
    .on('doctor_review_steps')
    .column('step')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('doctor_review_steps').execute()
  await db.schema.dropTable('doctor_reviews').execute()
  await db.schema.dropTable('doctor_review_requests').execute()
  await db.schema.dropTable('doctor_review').execute()
  await db.schema.dropType('doctor_review_step').execute()
}
