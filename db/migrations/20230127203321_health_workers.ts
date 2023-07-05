import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('health_workers')
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
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('email', 'varchar(255)', (col) => col.notNull())
    .addColumn('avatar_url', 'text', (col) => col.notNull())
    .addColumn('gcal_appointments_calendar_id', 'varchar(255)')
    .addColumn('gcal_availability_calendar_id', 'varchar(255)')
    .addUniqueConstraint('health_worker_email', ['email'])
    .execute()

  await addUpdatedAtTrigger(db, 'health_workers')
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('health_workers').execute()
}
