import { DB } from '../../db.d.ts'
import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createStandardTable(
    db,
    'doctor_registration_details_in_progress',
    (qb) =>
      qb.addColumn('health_worker_id', 'uuid', (column) =>
        column
          .references('health_workers.id')
          .onDelete('cascade')
          .notNull()
          .unique())
        .addColumn(
          'data',
          'jsonb',
          (column) => column.notNull().defaultTo('{}'),
        ),
  )

  await createStandardTable(
    db,
    'doctor_registration_details',
    (qb) =>
      qb.addColumn('health_worker_id', 'uuid', (column) =>
        column
          .references('health_workers.id')
          .onDelete('cascade')
          .notNull()
          .unique())
        .addColumn('sex', sql`sex`, (column) => column.notNull())
        .addColumn('gender', 'varchar(255)', (column) => column.notNull())
        .addColumn('national_id_number', 'varchar(50)', (column) =>
          column
            .notNull())
        .addColumn(
          'date_of_first_practice',
          'date',
          (column) => column.notNull(),
        )
        .addColumn('date_of_birth', 'date', (column) => column.notNull())
        .addColumn('ncz_registration_number', 'varchar(50)', (column) =>
          column
            .notNull()
            .check(sql`ncz_registration_number ~ '^[a-zA-Z]{2}[0-9]{6}$'`))
        .addColumn('mobile_number', 'varchar(50)')
        .addColumn('national_id_media_id', 'uuid', (column) =>
          column
            .references('media.id')
            .onDelete('set null'))
        .addColumn('address_id', 'uuid', (col) =>
          col
            .references('addresses.id')
            .onDelete('set null'))
        .addColumn(
          'ncz_registration_card_media_id',
          'uuid',
          (column) =>
            column
              .references('media.id')
              .onDelete('set null'),
        )
        .addColumn('face_picture_media_id', 'uuid', (column) =>
          column
            .references('media.id')
            .onDelete('set null'))
        .addColumn('doctor_practicing_cert_media_id', 'uuid', (column) =>
          column
            .references('media.id')
            .onDelete('set null'))
        .addColumn('approved_by', 'uuid', (column) =>
          column
            .references('health_workers.id')
            .onDelete('cascade')),
  )

  await db.schema
    .createIndex('idx_doctor_registration_details_national_id_media_id')
    .on('doctor_registration_details')
    .column('national_id_media_id')
    .execute()

  await db.schema
    .createIndex('idx_doctor_registration_details_address_id')
    .on('doctor_registration_details')
    .column('address_id')
    .execute()

  await db.schema
    .createIndex('idx_doctor_registration_details_ncz_registration_card_media_id')
    .on('doctor_registration_details')
    .column('ncz_registration_card_media_id')
    .execute()

  await db.schema
    .createIndex('idx_doctor_registration_details_face_picture_media_id')
    .on('doctor_registration_details')
    .column('face_picture_media_id')
    .execute()

  await db.schema
    .createIndex('idx_doctor_registration_details_doctor_practicing_cert_media_id')
    .on('doctor_registration_details')
    .column('doctor_practicing_cert_media_id')
    .execute()

  await db.schema
    .createIndex('idx_doctor_registration_details_approved_by')
    .on('doctor_registration_details')
    .column('approved_by')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('doctor_registration_details_in_progress').execute()
  await db.schema.dropTable('doctor_registration_details').execute()
}
