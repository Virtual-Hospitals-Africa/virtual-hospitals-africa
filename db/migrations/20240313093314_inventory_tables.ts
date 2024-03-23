import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'
import * as inParallel from '../../util/inParallel.ts'

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
      .addColumn('name', 'varchar(255)', (col) => col.notNull())
      .addColumn('is_medication', 'boolean'))

  await createStandardTable(db, 'facility_consumables', (qb) =>
    qb
      .addColumn('quantity_on_hand', 'integer', (col) => col.notNull())
      .addColumn('facility_id', 'integer', (col) =>
        col.notNull().references('facilities.id').onDelete('cascade'))
      .addColumn('consumable_id', 'integer', (col) =>
        col.notNull().references('consumables.id').onDelete('cascade'))
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
      .addColumn('procured_by', 'integer', (col) =>
        col.notNull().references('procurers.id').onDelete('cascade'))
      .addColumn('created_by', 'integer', (column) =>
        column.notNull().references('employment.id').onDelete('cascade'))
      .addColumn('expiry_date', 'timestamptz')
      .addColumn('specifics', 'json')
      .addCheckConstraint(
        'procurement_quantity',
        sql`
        quantity >= 0
       `,
      )
      .addCheckConstraint(
        'procurement_consumed_amount',
        sql`
        consumed_amount <= quantity
       `,
      ))

  await createStandardTable(db, 'consumption', (qb) =>
    qb
      .addColumn('facility_id', 'integer', (col) =>
        col.notNull().references('facilities.id').onDelete('cascade'))
      .addColumn('quantity', 'integer')
      .addColumn('created_by', 'integer', (column) =>
        column.notNull().references('employment.id').onDelete('cascade'))
      .addColumn('procurement_id', 'integer', (col) =>
        col.notNull().references('procurement.id').onDelete('cascade'))
      .addCheckConstraint(
        'consumption_quantity',
        sql`
        quantity >= 0
      `,
      ))

  await db.schema
    .alterTable('manufactured_medications')
    .addColumn('consumable_id', 'integer')
    .execute()

  await seedConsumablesFromMedications(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('facility_devices').execute()
  await db.schema.dropTable('device_capabilities').execute()
  await db.schema.dropTable('devices').execute()
  await db.schema
    .alterTable('manufactured_medications')
    .dropColumn('consumable_id')
    .execute()
  await db.schema.dropTable('facility_consumables').execute()
  await db.schema.dropTable('consumption').execute()
  await db.schema.dropTable('procurement').execute()
  await db.schema.dropTable('consumables').execute()
  await db.schema.dropTable('procurers').execute()
}

// deno-lint-ignore no-explicit-any
async function seedConsumablesFromMedications(db: Kysely<any>) {
  const medications = await db
    .selectFrom('manufactured_medications')
    .select(['id', 'trade_name', 'applicant_name'])
    .execute()

  await inParallel.forEach(medications, async (medication) => {
    const consumable = await db
      .insertInto('consumables')
      .values({
        name: medication.trade_name + '-' + medication.applicant_name,
        is_medication: true,
      })
      .returning('id')
      .executeTakeFirst()

    await db
      .updateTable('manufactured_medications')
      .set('consumable_id', consumable!.id)
      .where('id', '=', medication.id)
      .execute()
  })

  await db
    .insertInto('consumables')
    .values({ name: 'bandage', is_medication: false })
    .executeTakeFirst()
}
