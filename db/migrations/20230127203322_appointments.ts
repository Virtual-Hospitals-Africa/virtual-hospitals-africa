import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('appointments')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'created_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'patient_id',
      'integer',
      (col) => col.notNull().references('patients.id').onDelete('cascade'),
    )
    .addColumn('reason', 'varchar(255)', col => col.notNull())
    .addColumn('start', 'timestamptz', (col) => col.notNull())
    .addColumn('gcal_event_id', 'varchar(255)', col => col.notNull())
    .execute()

  await db.schema
    .createTable('appointment_health_worker_attendees')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'created_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'appointment_id',
      'integer',
      (col) =>
        col.notNull().references('appointments.id').onDelete('cascade'),
    )
    .addColumn(
      'health_worker_id',
      'integer',
      (col) =>
        col.notNull().references('health_workers.id').onDelete('cascade'),
    )
    .addColumn(
      'confirmed',
      'boolean',
      (col) => col.defaultTo(false).notNull(),
    )
    .execute()

  await db.schema
    .createTable('patient_appointment_requests')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'created_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'patient_id',
      'integer',
      (col) => col.notNull().references('patients.id').onDelete('cascade'),
    )
    .addColumn('reason', 'varchar(255)')
    .execute()

  await db.schema
    .createTable('patient_appointment_offered_times')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'created_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamp',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'patient_appointment_request_id',
      'integer',
      (col) => col.notNull().references('patient_appointment_requests.id').onDelete('cascade'),
    )
    .addColumn(
      'health_worker_id',
      'integer',
      (col) =>
        col.notNull().references('health_workers.id').onDelete('cascade'),
    )
    .addColumn('start', 'timestamptz', (col) => col.notNull())
    .addColumn('declined', 'boolean', (col) => col.defaultTo(false))
    .execute()

  await addUpdatedAtTrigger(db, 'appointments')
  await addUpdatedAtTrigger(db, 'appointment_health_worker_attendees')
  await addUpdatedAtTrigger(db, 'patient_appointment_requests')
  await addUpdatedAtTrigger(db, 'patient_appointment_offered_times')
  
  
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_appointment_offered_times').execute()
  await db.schema.dropTable('patient_appointment_requests').execute()
  await db.schema.dropTable('appointment_health_worker_attendees').execute()
  await db.schema.dropTable('appointments').execute()
}
