// deno-lint-ignore-file no-explicit-any
import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'
import { DOCTOR_REVIEW_STEPS } from '../../shared/review.ts'

export async function up(db: Kysely<any>) {
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
      .addColumn('encounter_id', 'uuid', (col) =>
        col
          .notNull()
          .references('patient_encounters.id')
          .onDelete('cascade'))
      .addColumn('requested_by', 'uuid', (col) =>
        col
          .notNull()
          .references('patient_encounter_providers.id')
          .onDelete('cascade'))
      .addColumn('organization_id', 'uuid', (col) =>
        col
          .references('Organization.id')
          .onDelete('cascade'))
      .addColumn('requesting_doctor_id', 'uuid', (col) =>
        col
          .references('employment.id')
          .onDelete('cascade'))
      .addColumn('requester_notes', 'text')
      .addColumn('pending', 'boolean', (col) => col.notNull().defaultTo(true))
      .addUniqueConstraint('once_per_patient_organization', [
        'patient_id',
        'organization_id',
      ])
      .addUniqueConstraint('once_per_patient_employee', [
        'patient_id',
        'requesting_doctor_id',
      ])
      .addCheckConstraint(
        'organization_or_requesting_employee',
        sql`
        (organization_id is not null and requesting_doctor_id is null) or
        (organization_id is null and requesting_doctor_id is not null)
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
      .addColumn('encounter_id', 'uuid', (col) =>
        col
          .notNull()
          .references('patient_encounters.id')
          .onDelete('cascade'))
      .addColumn('requested_by', 'uuid', (col) =>
        col
          .notNull()
          .references('patient_encounter_providers.id')
          .onDelete('cascade'))
      .addColumn('requester_notes', 'text')
      .addColumn('reviewer_notes', 'text')
      .addColumn('completed_at', 'timestamptz')
      .addUniqueConstraint('reviewed_once', [
        'encounter_id',
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
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('doctor_review_steps').execute()
  await db.schema.dropTable('doctor_reviews').execute()
  await db.schema.dropTable('doctor_review_requests').execute()
  await db.schema.dropTable('doctor_review').execute()
  await db.schema.dropType('doctor_review_step').execute()
}
