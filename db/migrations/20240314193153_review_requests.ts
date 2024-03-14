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
      .addColumn('encounter_id', 'integer', (col) =>
        col
          .notNull()
          .references('patient_encounters.id')
          .onDelete('cascade'))
      .addColumn('requested_by', 'integer', (col) =>
        col
          .notNull()
          .references('patient_encounter_providers.id')
          .onDelete('cascade'))
      .addColumn('facility_id', 'integer', (col) =>
        col
          .references('facilities.id')
          .onDelete('cascade'))
      .addColumn('requesting_employee_id', 'integer', (col) =>
        col
          .references('employment.id')
          .onDelete('cascade'))
      .addCheckConstraint(
        'facility_or_requesting_employee',
        sql`
        (facility_id is not null and requesting_employee_id is null) or
        (facility_id is null and requesting_employee_id is not null)
      `,
      ))

  await createStandardTable(db, 'doctor_reviews', (qb) =>
    qb
      .addColumn('review_request_id', 'integer', (col) =>
        col
          .notNull()
          .references('doctor_review_requests.id')
          .onDelete('cascade'))
      .addColumn('reviewer_id', 'integer', (col) =>
        col
          .notNull()
          .references('employment.id')
          .onDelete('cascade')))

  await createStandardTable(db, 'doctor_review_steps', (qb) =>
    qb.addColumn(
      'doctor_review_id',
      'integer',
      (col) =>
        col.notNull().references('doctor_reviews.id').onDelete(
          'cascade',
        ),
    )
      .addColumn(
        'doctor_review_step',
        sql`doctor_review_step`,
        (col) => col.notNull().references('doctor_review.step'),
      )
      .addUniqueConstraint('doctor_review_step_once', [
        'doctor_review_id',
        'doctor_review_step',
      ]))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('doctor_review_steps').execute()
  await db.schema.dropTable('doctor_reviews').execute()
  await db.schema.dropTable('doctor_review_requests').execute()
}
