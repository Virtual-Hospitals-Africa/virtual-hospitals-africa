import { Kysely, sql } from 'kysely'
import type { DB } from '../../db.d.ts'
import { createPointerTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createPointerTable(
    db,
    'patient_presence',
    {
      references: 'patients',
      primary_key_type: 'uuid',
      include_created_at: true,
      include_updated_at: true,
    },
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
          'organization_id',
          'uuid',
          (col) =>
            col.notNull().references('organizations.id').onDelete('cascade'),
        )
        .addColumn(
          'department_name',
          'varchar(255)',
          (col) =>
            col.notNull().references('departments.name').onDelete('cascade'),
        )
        .addColumn(
          'organization_room_id',
          'uuid',
          (col) =>
            col.notNull().references('organization_rooms.id').onDelete('cascade'),
        )
        .addColumn(
          'current_workflow',
          sql`workflow`,
        )
        .addColumn(
          'next_workflow',
          sql`workflow`,
        ).addCheckConstraint(
          'in_waiting_room_or_current_workflow',
          sql`(
            (department_name = 'Waiting room' AND current_workflow IS NULL AND next_workflow IS NOT NULL)
            OR
            (department_name != 'Waiting room' AND current_workflow IS NOT NULL)
          )`,
        ),
  )
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('patient_presence').execute()
}
