import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await createStandardTable(db, 'patient_encounters', (qb) =>
    qb
      .addColumn(
        'patient_id',
        'uuid',
        (col) => col.notNull().references('patients.id').onDelete('cascade'),
      )
      .addColumn('reason', sql`encounter_reason`, (col) => col.notNull())
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
      .addUniqueConstraint('only_one_open_encounter_per_patient', [
        'patient_id',
        'closed_at',
      ], (constraint) => constraint.nullsNotDistinct()))

  await createStandardTable(
    db,
    'patient_encounter_providers',
    (qb) =>
      qb.addColumn(
        'patient_encounter_id',
        'uuid',
        (col) =>
          col.notNull().references('patient_encounters.id').onDelete('cascade'),
      )
        .addColumn(
          'provider_id',
          'uuid',
          (col) =>
            col.notNull().references('employment.id').onDelete('cascade'),
        )
        .addColumn('seen_at', 'timestamptz'),
  )

  await createStandardTable(db, 'waiting_room', (qb) =>
    qb
      .addColumn(
        'organization_id',
        'uuid',
        (col) =>
          col.notNull().references('organizations.id').onDelete('cascade'),
      )
      .addColumn(
        'patient_encounter_id',
        'uuid',
        (col) =>
          col.notNull().references('patient_encounters.id').onDelete('cascade'),
      )
      .addUniqueConstraint('organization_patient_encounter', [
        'organization_id',
        'patient_encounter_id',
      ]))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('waiting_room').execute()
  await db.schema.dropTable('patient_encounter_providers').execute()
  await db.schema.dropTable('patient_encounters').execute()
}
