import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createType('status')
    .asEnum(['pending', 'confirmed', 'denied'])
    .execute()

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
    .addColumn('reason', 'varchar(255)')
    .addColumn('status', sql`status`, (column) => column.defaultTo('pending'))
    .execute()

  await db.schema
    .createTable('appointment_offered_times')
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
      (col) => col.notNull().references('appointments.id').onDelete('cascade'),
    )
    .addColumn(
      'health_worker_id',
      'integer',
      (col) =>
        col.notNull().references('health_workers.id').onDelete('cascade'),
    )
    .addColumn('start', 'varchar(255)', (col) => col.notNull())
    .addColumn('patient_declined', 'boolean', (col) => col.defaultTo(false))
    .addColumn('scheduled_gcal_event_id', 'varchar(255)')
    .execute()

  await addUpdatedAtTrigger(db, 'appointment_offered_times')
  await addUpdatedAtTrigger(db, 'appointments')
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('appointment_offered_times').execute()
  await db.schema.dropTable('appointments').execute()
  await db.schema.dropType('status').execute()
}
