import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'
import type { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
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

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('patient_encounter_steps').execute()
}
