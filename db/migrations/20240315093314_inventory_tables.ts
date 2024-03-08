import { Kysely } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await createStandardTable(
    db,
    'devices',
    (qb) =>
      qb.addColumn('name', 'varchar(255)', (col) => col.notNull())
        .addColumn('manufacturer', 'varchar(255)', (col) => col.notNull()),
  )

  await createStandardTable(
    db,
    'device_capabilities',
    (qb) =>
      qb.addColumn(
        'device_id',
        'integer',
        (col) => col.notNull().references('devices.id').onDelete('cascade'),
      )
        .addColumn(
          'diagnostic_test',
          'varchar(40)',
          (col) =>
            col.notNull().references('diagnostic_tests.name').onDelete(
              'cascade',
            ),
        ),
  )

  await createStandardTable(
    db,
    'facility_devices',
    (qb) =>
      qb.addColumn('serial_number', 'varchar(255)')
        .addColumn('created_by', 'integer', (column) =>
          column
            .notNull()
            .references('employment.id')
            .onDelete('cascade'))
        .addColumn('updated_by', 'integer', (column) =>
          column
            .references('employment.id')
            .onDelete('cascade'))
        .addColumn(
          'device_id',
          'integer',
          (col) => col.notNull().references('devices.id').onDelete('cascade'),
        )
        .addColumn(
          'facility_id',
          'integer',
          (col) =>
            col.notNull().references('facilities.id').onDelete('cascade'),
        ),
  )
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('facility_devices').execute()
  await db.schema.dropTable('device_capabilities').execute()
  await db.schema.dropTable('devices').execute()
}
