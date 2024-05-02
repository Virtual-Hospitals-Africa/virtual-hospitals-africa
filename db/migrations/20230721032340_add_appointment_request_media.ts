import { Kysely } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await createStandardTable(
    db,
    'patient_appointment_request_media',
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
          'media_id',
          'uuid',
          (col) => col.notNull().references('media.id').onDelete('cascade'),
        ),
  )

  await createStandardTable(db, 'appointment_media', (qb) =>
    qb.addColumn(
      'appointment_id',
      'uuid',
      (col) => col.notNull().references('appointments.id').onDelete('cascade'),
    )
      .addColumn(
        'media_id',
        'uuid',
        (col) => col.notNull().references('media.id').onDelete('cascade'),
      ))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_appointment_request_media').execute()
  await db.schema.dropTable('appointment_media').execute()
}
