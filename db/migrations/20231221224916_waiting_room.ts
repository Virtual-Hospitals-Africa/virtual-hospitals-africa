import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'
import { ENCOUNTER_REASONS } from '../../shared/encounter.ts'

export async function up(db: Kysely<unknown>) {
  await db
    .schema
    .createType('encounter_reason')
    .asEnum(Array.from(ENCOUNTER_REASONS))
    .execute()

  await db.schema
    .createTable('patient_encounters')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'patient_id',
      'integer',
      (col) => col.notNull().references('patients.id').onDelete('cascade'),
    )
    .addColumn('reason', sql`encounter_reason`, (col) => col.notNull())
    .addColumn(
      'appointment_id',
      'integer',
      (col) => col.references('appointments.id').onDelete('cascade'),
    )
    .addColumn('notes', 'text')
    .addColumn(
      'created_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'closed_at',
      'timestamptz',
    )
    .addCheckConstraint(
      'appointment_has_appointment',
      sql`
      (appointment_id IS NULL AND reason != 'appointment') OR
      (appointment_id IS NOT NULL AND reason = 'appointment')
    `,
    )
    .addCheckConstraint(
      'other_reason_has_notes',
      sql`
      (reason != 'other') OR (reason = 'other' AND notes IS NOT NULL)
    `,
    )
    .execute()

  await db.schema
    .createTable('patient_encounter_providers')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'patient_encounter_id',
      'integer',
      (col) =>
        col.notNull().references('patient_encounters.id').onDelete('cascade'),
    )
    .addColumn(
      'provider_id',
      'integer',
      (col) => col.notNull().references('employment.id').onDelete('cascade'),
    )
    .addColumn('seen_at', 'timestamptz')
    .addColumn(
      'created_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .execute()

  await db.schema
    .createTable('waiting_room')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'facility_id',
      'integer',
      (col) => col.notNull().references('facilities.id').onDelete('cascade'),
    )
    .addColumn(
      'patient_encounter_id',
      'integer',
      (col) =>
        col.notNull().references('patient_encounters.id').onDelete('cascade'),
    )
    .addColumn(
      'created_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addUniqueConstraint('facility_patient_encounter', [
      'facility_id',
      'patient_encounter_id',
    ])
    .execute()

  await addUpdatedAtTrigger(db, 'patient_encounters')
  await addUpdatedAtTrigger(db, 'patient_encounter_providers')
  await addUpdatedAtTrigger(db, 'waiting_room')
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('waiting_room').execute()
  await db.schema.dropTable('patient_encounter_providers').execute()
  await db.schema.dropTable('patient_encounters').execute()
  await db.schema.dropType('encounter_reason').execute()
}
