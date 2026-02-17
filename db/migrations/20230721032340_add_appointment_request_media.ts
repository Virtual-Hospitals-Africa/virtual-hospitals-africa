import type { DB } from '../../db.d.ts'
import { Kysely } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
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

  await db.schema
    .createIndex('idx_patient_appointment_request_media_patient_appointment_request_id')
    .on('patient_appointment_request_media')
    .column('patient_appointment_request_id')
    .execute()

  await db.schema
    .createIndex('idx_patient_appointment_request_media_media_id')
    .on('patient_appointment_request_media')
    .column('media_id')
    .execute()

  await db.schema
    .createIndex('idx_appointment_media_appointment_id')
    .on('appointment_media')
    .column('appointment_id')
    .execute()

  await db.schema
    .createIndex('idx_appointment_media_media_id')
    .on('appointment_media')
    .column('media_id')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('patient_appointment_request_media').execute()
  await db.schema.dropTable('appointment_media').execute()
}
