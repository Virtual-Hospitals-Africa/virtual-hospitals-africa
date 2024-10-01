import { Kysely, sql } from 'kysely'
import { NURSE_SPECIALTIES } from '../../types.ts'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createType('gender')
    .asEnum([
      'male',
      'female',
      'non-binary',
    ])
    .execute()

  await db
    .schema
    .createType('nurse_specialty')
    .asEnum(NURSE_SPECIALTIES)
    .execute()

  await createStandardTable(
    db,
    'nurse_specialties',
    (qb) =>
      qb.addColumn('employee_id', 'uuid', (column) =>
        column
          .notNull()
          .unique()
          .references('employment.id')
          .onDelete('cascade'))
        .addColumn(
          'specialty',
          sql`nurse_specialty`,
          (column) => column.notNull(),
        )
        .addUniqueConstraint('one_unique_nurse_specialty_per_employee', [
          'employee_id',
          'specialty',
        ]),
  )

  await createStandardTable(
    db,
    'nurse_registration_details_in_progress',
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
    'nurse_registration_details',
    (qb) =>
      qb.addColumn('health_worker_id', 'uuid', (column) =>
        column
          .references('health_workers.id')
          .onDelete('cascade')
          .notNull()
          .unique())
        .addColumn('gender', sql`gender`, (column) => column.notNull())
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
        .addColumn('mobile_number', 'varchar(50)', (column) => column.notNull())
        .addColumn('national_id_media_id', 'uuid', (column) =>
          column
            .references('media.id')
            .onDelete('set null'))
        .addColumn('address_id', 'uuid', (col) =>
          col
            .references('address.id')
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
        .addColumn('nurse_practicing_cert_media_id', 'uuid', (column) =>
          column
            .references('media.id')
            .onDelete('set null'))
        .addColumn('approved_by', 'uuid', (column) =>
          column
            .references('health_workers.id')
            .onDelete('cascade'))
        .addCheckConstraint(
          'nurse_registration_details_national_id_number_check',
          sql`national_id_number ~ '^[0-9]{2}-[0-9]{6,7} [A-Z] [0-9]{2}$'`,
        ),
  )
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('nurse_registration_details_in_progress').execute()
  await db.schema.dropTable('nurse_registration_details').execute()
  await db.schema.dropTable('nurse_specialties').execute()
  await db.schema.dropType('nurse_specialty').execute()
  await db.schema.dropType('gender').execute()
}
