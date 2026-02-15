import type { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createTable.ts'
import { ENCOUNTER_REASONS } from '../../shared/reasons.ts'

export async function up(db: Kysely<DB>) {
  await db
    .schema
    .createType('encounter_reason')
    .asEnum(ENCOUNTER_REASONS)
    .execute()

  await createStandardTable(db, 'patient_encounters', (qb) =>
    qb
      .addColumn(
        'patient_id',
        'uuid',
        (col) => col.notNull().references('patients.id').onDelete('cascade'),
      )
      .addColumn('reason', sql`encounter_reason`)
      // In the future we will support encounters with patients that aren't physical,
      // but in the meanwhile this is the main use case
      .addColumn(
        'organization_id',
        'uuid',
        (col) => col.notNull().references('organizations.id').onDelete('cascade'),
      )
      .addColumn(
        'appointment_id',
        'uuid',
        (col) => col.references('appointments.id').onDelete('cascade'),
      )
      .addColumn('notes', 'text')
      .addColumn('location', sql`GEOGRAPHY(POINT,4326)`, (col) => col.notNull())
      .addColumn(
        'closed_at',
        'timestamptz',
      )
      .addUniqueConstraint('only_one_open_encounter_per_patient', [
        'patient_id',
        'closed_at',
      ], (constraint) => constraint.nullsNotDistinct()))

  await db.schema
    .createIndex('idx_patient_encounters_organization_id')
    .on('patient_encounters')
    .column('organization_id')
    .execute()

  await db.schema
    .createIndex('idx_patient_encounters_appointment_id')
    .on('patient_encounters')
    .column('appointment_id')
    .execute()

  await db.schema
    .createIndex('idx_patient_encounters_closed_at')
    .on('patient_encounters')
    .column('closed_at')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('patient_encounters').execute()
  await db.schema.dropType('encounter_reason').execute()
}
