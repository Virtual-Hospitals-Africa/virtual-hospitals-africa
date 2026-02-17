import type { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createTable.ts'
import { EMERGENCY_CONTACT_RELATIONSHIPS } from '../../shared/family.ts'

export async function up(db: Kysely<DB>) {
  await db.schema
    .createType('emergency_contact_relationship')
    .asEnum(EMERGENCY_CONTACT_RELATIONSHIPS)
    .execute()

  await createStandardTable(
    db,
    'patient_emergency_contacts',
    (qb) =>
      qb.addColumn(
        'patient_id',
        'uuid',
        (col) => col.notNull().references('patients.id').onDelete('cascade'),
      )
        .addColumn('name', 'varchar(255)', (col) => col.notNull())
        .addColumn(
          'relationship',
          sql`emergency_contact_relationship`,
          (col) => col.notNull(),
        )
        .addColumn('phone_number', 'varchar(50)')
        .addColumn(
          'contact_order',
          'integer',
          (col) => col.notNull().defaultTo(0),
        )
        .addUniqueConstraint('only_one_emergency_contact_per_patient', [
          'patient_id',
          'contact_order',
        ]),
  )

  await db.schema
    .createIndex('idx_patient_emergency_contacts_contact_order')
    .on('patient_emergency_contacts')
    .column('contact_order')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('patient_emergency_contacts').execute()
  await db.schema.dropType('emergency_contact_relationship').execute()
}
