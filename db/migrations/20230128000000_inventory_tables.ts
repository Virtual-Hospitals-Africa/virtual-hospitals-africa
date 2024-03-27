import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await createStandardTable(db, 'devices', (qb) =>
    qb
      .addColumn('name', 'varchar(255)', (col) => col.notNull())
      .addColumn('manufacturer', 'varchar(255)', (col) => col.notNull()))

  await createStandardTable(db, 'device_capabilities', (qb) =>
    qb
      .addColumn('device_id', 'integer', (col) =>
        col.notNull().references('devices.id').onDelete('cascade'))
      .addColumn('diagnostic_test', 'varchar(40)', (col) =>
        col.notNull().references('diagnostic_tests.name').onDelete('cascade')))

  await createStandardTable(db, 'facility_devices', (qb) =>
    qb
      .addColumn('serial_number', 'varchar(255)')
      .addColumn('created_by', 'integer', (column) =>
        column.notNull().references('employment.id').onDelete('cascade'))
      .addColumn('updated_by', 'integer', (column) =>
        column.references('employment.id').onDelete('cascade'))
      .addColumn('device_id', 'integer', (col) =>
        col.notNull().references('devices.id').onDelete('cascade'))
      .addColumn('facility_id', 'integer', (col) =>
        col.notNull().references('facilities.id').onDelete('cascade')))

  await createStandardTable(
    db,
    'procurers',
    (qb) =>
      qb.addColumn('name', 'varchar(255)', (col) => col.notNull().unique()),
  )

  await createStandardTable(db, 'consumables', (qb) =>
    qb
      .addColumn('name', 'text', (col) => col.notNull())
      .addColumn('is_medication', 'boolean'))

  await createStandardTable(db, 'facility_consumables', (qb) =>
    qb
      .addColumn('facility_id', 'integer', (col) =>
        col.notNull().references('facilities.id').onDelete('cascade'))
      .addColumn('consumable_id', 'integer', (col) =>
        col.notNull().references('consumables.id').onDelete('cascade'))
      .addColumn('quantity_on_hand', 'integer', (col) =>
        col.notNull())
      .addUniqueConstraint('facility_consumable', [
        'facility_id',
        'consumable_id',
      ])
      .addCheckConstraint(
        'facility_consumables_quantity_on_hand',
        sql`
          quantity_on_hand >= 0
        `,
      ))

  await createStandardTable(db, 'procurement', (qb) =>
    qb
      .addColumn('facility_id', 'integer', (col) =>
        col.notNull().references('facilities.id').onDelete('cascade'))
      .addColumn('quantity', 'integer', (col) =>
        col.notNull())
      .addColumn('consumed_amount', 'integer', (col) =>
        col.notNull().defaultTo(0))
      .addColumn('consumable_id', 'integer', (col) =>
        col.notNull().references('consumables.id').onDelete('cascade'))
      .addColumn('procured_from', 'integer', (col) =>
        col.notNull().references('procurers.id').onDelete('cascade'))
      .addColumn('created_by', 'integer', (column) =>
        column.notNull().references('employment.id').onDelete('cascade'))
      .addColumn('expiry_date', 'date')
      .addColumn('batch_number', 'varchar(255)')
      .addCheckConstraint(
        'positive_procurement_quantity',
        sql`
        quantity > 0
       `,
      )
      .addCheckConstraint(
        'nonnegative_procurement_consumed_amount',
        sql`
        consumed_amount >= 0
       `,
      )
      .addCheckConstraint(
        'procurement_consumed_amount_less_than_quantity',
        sql`
        consumed_amount <= quantity
       `,
      ))

  await createStandardTable(db, 'consumption', (qb) =>
    qb
      .addColumn('facility_id', 'integer', (col) =>
        col.notNull().references('facilities.id').onDelete('cascade'))
      .addColumn('quantity', 'integer', (col) =>
        col.notNull())
      .addColumn('created_by', 'integer', (column) =>
        column.notNull().references('employment.id').onDelete('cascade'))
      .addColumn('procurement_id', 'integer', (col) =>
        col.notNull().references('procurement.id').onDelete('cascade'))
      .addCheckConstraint(
        'consumption_quantity',
        sql`
        quantity > 0
      `,
      ))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('facility_devices').execute()
  await db.schema.dropTable('device_capabilities').execute()
  await db.schema.dropTable('devices').execute()
  await db.schema.dropTable('facility_consumables').execute()
  await db.schema.dropTable('consumption').execute()
  await db.schema.dropTable('procurement').execute()
  await db.schema.dropTable('consumables').execute()
  await db.schema.dropTable('procurers').execute()
}
