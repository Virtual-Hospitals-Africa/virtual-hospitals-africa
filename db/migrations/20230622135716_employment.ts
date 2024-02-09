import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createType('health_worker_professions')
    .asEnum([
      'admin',
      'doctor',
      'nurse',
    ])
    .execute()

  await db.schema
    .createTable('employment')
    .addColumn('id', 'serial', (col) => col.primaryKey())
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
    .addColumn('health_worker_id', 'integer', (col) =>
      col.notNull()
        .references('health_workers.id')
        .onDelete('cascade'))
    .addColumn('facility_id', 'integer', (col) =>
      col.notNull()
        .references('facilities.id')
        .onDelete('cascade'))
    .addColumn(
      'profession',
      sql`health_worker_professions`,
      (column) => column.notNull(),
    )
    .addUniqueConstraint('only_employed_once_per_profession', [
      'health_worker_id',
      'facility_id',
      'profession',
    ])
    .execute()

  await addUpdatedAtTrigger(db, 'employment')

  await db.schema.createTable('employment_calendars')
    .addColumn('id', 'serial', (col) => col.primaryKey())
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
    .addColumn('health_worker_id', 'integer', (col) => col.notNull())
    .addColumn('facility_id', 'integer', (col) => col.notNull())
    .addColumn(
      'gcal_appointments_calendar_id',
      'varchar(255)',
      (col) => col.notNull(),
    )
    .addColumn(
      'gcal_availability_calendar_id',
      'varchar(255)',
      (col) => col.notNull(),
    )
    .addColumn(
      'availability_set',
      'boolean',
      (col) => col.notNull().defaultTo(false),
    )
    .addUniqueConstraint('only_one_calendar_set_per_health_worker_facility', [
      'health_worker_id',
      'facility_id',
    ])
    .execute()

  await addUpdatedAtTrigger(db, 'employment_calendars')
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('employment_calendars').execute()
  await db.schema.dropTable('employment').execute()
  await db.schema.dropType('health_worker_professions').execute()
}
