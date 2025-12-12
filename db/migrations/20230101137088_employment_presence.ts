import { Kysely, sql } from 'kysely'
import type { DB } from '../../db.d.ts'
import { createPointerTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createPointerTable(
    db,
    'employment_presence',
    {
      references: 'employment',
      primary_key_type: 'uuid',
      include_created_at: true,
      include_updated_at: true,
    },
    (qb) =>
      qb
        .addColumn(
          'at_work',
          'boolean',
          (col) => col.notNull().defaultTo(false),
        )
        .addColumn(
          'with_patient_id',
          'uuid',
          (col) => col.references('patient_presence.id').onDelete('cascade'),
        )
        .addCheckConstraint(
          'not_seeing_a_patient_at_home',
          sql`(
            NOT (with_patient_id IS NOT NULL AND NOT at_work)
          )`,
        ),
  )
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('employment_presence').execute()
}
