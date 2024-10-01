import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export function up(db: Kysely<unknown>) {
  return createStandardTable(
    db,
    'patient_kin',
    (qb) =>
      qb.addColumn('relationship', 'varchar(255)', (col) => col.notNull())
        .addColumn(
          'patient_id',
          'uuid',
          (col) => col.notNull().references('Patient.id').onDelete('cascade'),
        )
        .addColumn(
          'next_of_kin_patient_id',
          'uuid',
          (col) => col.notNull().references('Patient.id').onDelete('cascade'),
        )
        .addUniqueConstraint('unique_patient_next_of_kin', ['patient_id'])
        .addCheckConstraint(
          'next_of_kin_no_relationship_to_self',
          sql`
      patient_id != next_of_kin_patient_id
    `,
        ),
  )
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_kin').execute()
}
