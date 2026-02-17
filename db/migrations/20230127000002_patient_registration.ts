import type { DB } from '../../db.d.ts'
import { Kysely } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(
    db,
    'patient_registration',
    (qb) =>
      qb.addColumn('patient_id', 'uuid', (col) =>
        col.notNull().unique()
          .references('patients.id')
          .onDelete('cascade'))
        .addColumn('organization_id', 'uuid', (col) =>
          col.notNull()
            .references('organizations.id')
            .onDelete('cascade'))
        .addColumn('being_taken_by', 'uuid', (col) =>
          col.notNull()
            .references('employment.id')
            .onDelete('cascade')),
  )

  await db.schema
    .createIndex('idx_patient_registration_organization_id')
    .on('patient_registration')
    .column('organization_id')
    .execute()

  await db.schema
    .createIndex('idx_patient_registration_being_taken_by')
    .on('patient_registration')
    .column('being_taken_by')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('patient_registration').execute()
}
