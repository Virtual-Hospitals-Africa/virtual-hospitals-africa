import { Kysely, sql } from 'kysely'
import { ENCOUNTER_STEPS } from '../../shared/encounter.ts'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

// deno-lint-ignore no-explicit-any
export async function up(db: Kysely<any>) {
  await db.schema.createType('encounter_step')
    .asEnum(ENCOUNTER_STEPS)
    .execute()

  await db.schema.createTable('encounter')
    .addColumn('step', sql`encounter_step`, (col) => col.primaryKey())
    .addColumn('order', 'int8', (col) => col.notNull().unique())
    .execute()

  await db.insertInto('encounter')
    .values(ENCOUNTER_STEPS.map((step, i) => ({ step, order: i + 1 })))
    .execute()

  await db.schema.createTable('patient_encounter_steps')
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
      'patient_encounter_id',
      'integer',
      (col) =>
        col.notNull().references('patient_encounters.id').onDelete(
          'cascade',
        ),
    )
    .addColumn(
      'encounter_step',
      sql`encounter_step`,
      (col) => col.notNull().references('encounter.step'),
    )
    .addUniqueConstraint('patient_encounter_step', [
      'patient_encounter_id',
      'encounter_step',
    ])
    .execute()

  await addUpdatedAtTrigger(db, 'patient_encounter_steps')
}

// deno-lint-ignore no-explicit-any
export async function down(db: Kysely<any>) {
  await db.schema.dropTable('patient_encounter_steps').execute()
  await db.schema.dropTable('encounter').execute()
  await db.schema.dropType('encounter_step').execute()
}
