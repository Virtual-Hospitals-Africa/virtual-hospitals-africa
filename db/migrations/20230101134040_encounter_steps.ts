import { Kysely, sql } from 'kysely'
import { ENCOUNTER_STEPS } from '../../shared/encounter.ts'
import type { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
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
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('encounter').execute()
  await db.schema.dropType('encounter_step').execute()
}
