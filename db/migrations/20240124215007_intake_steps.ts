import { Kysely, sql } from 'kysely'
import { INTAKE_STEPS } from '../../shared/intake.ts'
import { createStandardTable } from '../createStandardTable.ts'
import { now } from '../helpers.ts'

// deno-lint-ignore no-explicit-any
export async function up(db: Kysely<any>) {
  await db.schema.createTable('patient_intake_completed')
    .addColumn(
      'patient_id',
      'uuid',
      (col) => col.primaryKey().notNull().references('Patient.id'),
    )
    .addColumn(
      'completed_by_employment_id',
      'uuid',
      (col) => col.notNull().references('employment.id'),
    )
    .addColumn(
      'completed_at',
      'timestamp',
      (col) => col.defaultTo(now).notNull(),
    )
    .execute()

  await db.schema.createType('intake_step')
    .asEnum(INTAKE_STEPS)
    .execute()

  await db.schema.createTable('intake')
    .addColumn('step', sql`intake_step`, (col) => col.primaryKey())
    .addColumn('order', 'int8', (col) => col.notNull().unique())
    .execute()

  await db.insertInto('intake')
    .values(INTAKE_STEPS.map((step, i) => ({ step, order: i + 1 })))
    .execute()

  await createStandardTable(db, 'patient_intake', (qb) =>
    qb.addColumn(
      'patient_id',
      'uuid',
      (col) =>
        col.notNull().references('Patient.id').onDelete(
          'cascade',
        ),
    )
      .addColumn(
        'intake_step',
        sql`intake_step`,
        (col) => col.notNull().references('intake.step'),
      )
      .addColumn(
        'completed_by_employment_id',
        'uuid',
        (col) => col.notNull().references('employment.id'),
      )
      .addUniqueConstraint('patient_intake_step', [
        'patient_id',
        'intake_step',
      ]))
}

// deno-lint-ignore no-explicit-any
export async function down(db: Kysely<any>) {
  await db.schema.dropTable('patient_intake').execute()
  await db.schema.dropTable('intake').execute()
  await db.schema.dropType('intake_step').execute()
  await db.schema.dropTable('patient_intake_completed').execute()
}
