import { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await db
    .schema
    .createTable('patient_appointment_request_media')
    .addColumn(
      'patient_appointment_request_id',
      'integer',
      (col) => col.references('patient_appointment_requests.id'),
    )
    .addColumn('media_id', 'integer', (col) => col.references('media.id'))
    .execute()

  await db.schema.createTable('appointment_media')
    .addColumn(
      'appointment_id',
      'integer',
      (col) => col.references('appointments.id'),
    )
    .addColumn('media_id', 'integer', (col) => col.references('media.id'))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_appointment_request_media').execute()
  await db.schema.dropTable('appointment_media').execute()
}
