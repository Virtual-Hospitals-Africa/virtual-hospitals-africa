import { Kysely, sql } from 'kysely'
import { ENCOUNTER_STEPS } from '../../shared/encounter.ts'

// deno-lint-ignore no-explicit-any
export async function up(db: Kysely<any>) {
  await db.schema.createType('encounter_step')
    .asEnum(ENCOUNTER_STEPS)
    .execute()

  await db.schema.alterTable('patient_encounters')
    .addColumn('steps_completed', sql`encounter_step[]`, (col) =>
      col
        .notNull()
        .defaultTo(sql`ARRAY[]::encounter_step[]`))
    .execute()
}

// deno-lint-ignore no-explicit-any
export async function down(db: Kysely<any>) {
  await db.schema.alterTable('patient_encounters')
    .dropColumn('steps_completed')
    .execute()

  await db.schema.dropType('encounter_step').execute()
}
