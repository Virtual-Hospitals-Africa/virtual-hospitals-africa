import { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export function up(db: Kysely<DB>) {
  return createStandardTable(
    db,
    'patient_emergency_contacts',
    (qb) =>
      qb.addColumn('relationship', 'varchar(255)', (col) => col.notNull())
        .addColumn(
          'patient_id',
          'uuid',
          (col) => col.notNull().references('patients.id').onDelete('cascade'),
        )
        .addColumn(
          'emergency_contact_patient_id',
          'uuid',
          (col) => col.references('patients.id').onDelete('set null'),
        )
        .addColumn(
          'emergency_contact_name',
          'varchar(255)',
        )
        .addColumn(
          'emergency_contact_phone_number',
          'varchar(255)',
        )
        .addCheckConstraint(
          'emergency_contact_no_relationship_to_self',
          sql`patient_id != emergency_contact_patient_id`,
        )
        .addCheckConstraint(
          'emergency_contact_name_or_patient_id',
          sql`(emergency_contact_patient_id IS NULL) = (emergency_contact_name IS NOT NULL)`,
        )
        ,
  )
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('patient_emergency_contacts').execute()
}
