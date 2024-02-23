import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await db
    .schema
    .createTable('patient_appointment_request_media')
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
    .addColumn(
      'patient_appointment_request_id',
      'integer',
      (col) =>
        col.notNull().references('patient_appointment_requests.id').onDelete(
          'cascade',
        ),
    )
    .addColumn(
      'media_id',
      'integer',
      (col) => col.notNull().references('media.id').onDelete('cascade'),
    )
    .execute()

  await db.schema.createTable('appointment_media')
    .addColumn(
      'appointment_id',
      'integer',
      (col) => col.notNull().references('appointments.id').onDelete('cascade'),
    )
    .addColumn(
      'media_id',
      'integer',
      (col) => col.notNull().references('media.id').onDelete('cascade'),
    )
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_appointment_request_media').execute()
  await db.schema.dropTable('appointment_media').execute()
}
