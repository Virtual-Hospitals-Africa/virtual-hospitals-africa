import { Kysely, sql } from 'kysely'
import type { DB } from '../../db.d.ts'
import { createPointerTable, createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(
    db,
    `patient_workflows`,
    (qb) =>
      qb.addColumn(
        'patient_encounter_id',
        'uuid',
        (col) =>
          col.notNull().references('patient_encounters.id').onDelete(
            'cascade',
          ),
      )
        .addColumn(
          'workflow',
          sql`workflow`,
          (col) => col.notNull(),
        ),
  )
  await createPointerTable(
    db,
    'patient_workflows_completed',
    {
      references: 'patient_workflows',
      primary_key_type: 'uuid',
      include_created_at: true,
    },
  )
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('patient_workflows_completed').execute()
  await db.schema.dropTable('patient_workflows').execute()
}
