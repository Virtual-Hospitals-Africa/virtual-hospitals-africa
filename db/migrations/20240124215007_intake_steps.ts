import { Kysely, sql } from 'kysely'
import { INTAKE_STEPS } from '../../shared/intake.ts'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

// deno-lint-ignore no-explicit-any
export async function up(db: Kysely<any>) {
  await db.updateTable('patients')
    .set('completed_intake', false)
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

  await db.schema.createTable('patient_intake')
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
      (col) =>
        col.notNull().references('patients.id').onDelete(
          'cascade',
        ),
    )
    .addColumn(
      'intake_step',
      sql`intake_step`,
      (col) => col.notNull().references('intake.step'),
    )
    .addUniqueConstraint('patient_intake_step', ['patient_id', 'intake_step'])
    .execute()

  await addUpdatedAtTrigger(db, 'patient_intake')
}

// deno-lint-ignore no-explicit-any
export async function down(db: Kysely<any>) {
  await db.schema.dropTable('patient_intake').execute()
  await db.schema.dropTable('intake').execute()
  await db.schema.dropType('intake_step').execute()
}
