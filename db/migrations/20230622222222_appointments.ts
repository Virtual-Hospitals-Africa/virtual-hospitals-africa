import { Kysely } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await createStandardTable(db, 'appointments', (qb) =>
    qb.addColumn(
      'patient_id',
      'uuid',
      (col) => col.notNull().references('patients.id').onDelete('cascade'),
    )
      .addColumn('reason', 'varchar(255)', (col) => col.notNull())
      .addColumn('start', 'timestamptz', (col) => col.notNull())
      .addColumn('gcal_event_id', 'varchar(255)', (col) => col.notNull()))

  await createStandardTable(db, 'appointment_providers', (qb) =>
    qb.addColumn(
      'appointment_id',
      'uuid',
      (col) => col.notNull().references('appointments.id').onDelete('cascade'),
    )
      .addColumn(
        'provider_id',
        'uuid',
        (col) => col.notNull().references('employment.id').onDelete('cascade'),
      )
      .addColumn(
        'confirmed',
        'boolean',
        (col) => col.defaultTo(false).notNull(),
      ))

  await createStandardTable(
    db,
    'patient_appointment_requests',
    (qb) =>
      qb.addColumn(
        'patient_id',
        'uuid',
        (col) => col.notNull().references('patients.id').onDelete('cascade'),
      )
        .addColumn('reason', 'varchar(255)'),
  )

  await createStandardTable(
    db,
    'patient_appointment_offered_times',
    (qb) =>
      qb.addColumn(
        'patient_appointment_request_id',
        'uuid',
        (col) =>
          col.notNull().references('patient_appointment_requests.id').onDelete(
            'cascade',
          ),
      )
        .addColumn(
          'provider_id',
          'uuid',
          (col) =>
            col.notNull().references('employment.id').onDelete('cascade'),
        )
        .addColumn('start', 'timestamptz', (col) => col.notNull())
        .addColumn(
          'declined',
          'boolean',
          (col) => col.notNull().defaultTo(false),
        ),
  )
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_appointment_offered_times').execute()
  await db.schema.dropTable('patient_appointment_requests').execute()
  await db.schema.dropTable('appointment_providers').execute()
  await db.schema.dropTable('appointments').execute()
}
