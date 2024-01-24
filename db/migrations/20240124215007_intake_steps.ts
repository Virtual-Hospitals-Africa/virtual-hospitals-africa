import { Kysely, sql } from 'kysely'
import { INTAKE_STEPS } from '../../shared/intake.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema.createType('intake_step')
    .asEnum(INTAKE_STEPS)
    .execute()

  await db.schema.alterTable('patients')
    .addColumn('intake_steps_completed', sql`intake_step[]`, (col) =>
      col
        .notNull()
        .defaultTo(sql`ARRAY[]::intake_step[]`)
        .check(sql`(
          (completed_intake = FALSE AND cardinality(intake_steps_completed) < ${
          sql.lit(INTAKE_STEPS.length)
        }) OR
          (completed_intake = TRUE AND cardinality(intake_steps_completed) = ${
          sql.lit(INTAKE_STEPS.length)
        })
        )`))
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.alterTable('patients')
    .dropColumn('intake_steps_completed')
    .execute()

  await db.schema.dropType('intake_step').execute()
}
