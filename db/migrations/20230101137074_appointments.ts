import type { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(db, 'appointments', (qb) =>
    qb.addColumn(
      'patient_id',
      'uuid',
      (col) => col.notNull().references('patients.id').onDelete('cascade'),
    )
      .addColumn('reason', 'varchar(255)', (col) => col.notNull())
      .addColumn('start', 'timestamptz', (col) => col.notNull())
      .addColumn('end', 'timestamptz', (col) => col.notNull())
      .addColumn('duration_minutes', 'integer', (col) => col.notNull().check(sql`duration_minutes > 0`))
      .addColumn('gcal_event_id', 'varchar(255)', (col) => col.notNull())
      .addColumn('gcal_hangout_link', 'varchar(255)'))

  await createStandardTable(db, 'appointment_employees', (qb) =>
    qb.addColumn(
      'appointment_id',
      'uuid',
      (col) => col.notNull().references('appointments.id').onDelete('cascade'),
    )
      .addColumn(
        'employee_id',
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
          'employee_id',
          'uuid',
          (col) => col.notNull().references('employment.id').onDelete('cascade'),
        )
        .addColumn('start', 'timestamptz', (col) => col.notNull())
        .addColumn('end', 'timestamptz', (col) => col.notNull())
        .addColumn('duration_minutes', 'integer', (col) => col.notNull().check(sql`duration_minutes > 0`))
        .addColumn(
          'declined',
          'boolean',
          (col) => col.notNull().defaultTo(false),
        ),
  )

  await db.schema
    .createIndex('idx_appointments_patient_id')
    .on('appointments')
    .column('patient_id')
    .execute()

  await db.schema
    .createIndex('idx_appointment_employees_appointment_id')
    .on('appointment_employees')
    .column('appointment_id')
    .execute()

  await db.schema
    .createIndex('idx_appointment_employees_employee_id')
    .on('appointment_employees')
    .column('employee_id')
    .execute()

  await db.schema
    .createIndex('idx_patient_appointment_requests_patient_id')
    .on('patient_appointment_requests')
    .column('patient_id')
    .execute()

  await db.schema
    .createIndex('idx_patient_appointment_offered_times_patient_appointment_request_id')
    .on('patient_appointment_offered_times')
    .column('patient_appointment_request_id')
    .execute()

  await db.schema
    .createIndex('idx_patient_appointment_offered_times_employee_id')
    .on('patient_appointment_offered_times')
    .column('employee_id')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('patient_appointment_offered_times').execute()
  await db.schema.dropTable('patient_appointment_requests').execute()
  await db.schema.dropTable('appointment_employees').execute()
  await db.schema.dropTable('appointments').execute()
}
