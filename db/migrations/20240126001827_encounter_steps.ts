import { Kysely, sql } from 'kysely'
import { ENCOUNTER_STEPS } from '../../shared/encounter.ts'
import { createStandardTable } from '../createStandardTable.ts'

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

  await createStandardTable(db, 'patient_encounter_steps', (qb) =>
    qb.addColumn(
      'patient_encounter_id',
      'uuid',
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
      ]))
}

// deno-lint-ignore no-explicit-any
export async function down(db: Kysely<any>) {
  await db.schema.dropTable('patient_encounter_steps').execute()
  await db.schema.dropTable('encounter').execute()
  await db.schema.dropType('encounter_step').execute()
}
