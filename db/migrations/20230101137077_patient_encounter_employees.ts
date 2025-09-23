import { Kysely } from 'kysely'
import type { DB } from '../../db.d.ts'
import { createStandardTable } from '../createTable.ts'
import { now } from '../helpers.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(
    db,
    'patient_encounter_employees',
    (qb) =>
      qb
        .addColumn(
          'patient_encounter_id',
          'uuid',
          (col) =>
            col.notNull().references('patient_encounters.id').onDelete(
              'cascade',
            ),
        )
        .addColumn(
          'employment_id',
          'uuid',
          (col) =>
            col.notNull().references('employment.id').onDelete('cascade'),
        )
        .addColumn(
          'seen_at',
          'timestamptz',
          (col) => col.notNull().defaultTo(now),
        ),
  )
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('patient_encounter_employees').execute()
}
