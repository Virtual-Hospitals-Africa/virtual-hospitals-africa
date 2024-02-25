//deno-lint-ignore-file no-explicit-any
import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'
import uniq from '../../util/uniq.ts'
import parseJSON from '../../util/parseJSON.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('facility_rooms')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('facility_id', 'integer', (col) =>
      col.notNull().references('facilities.id').onDelete('cascade')
    )
    .execute()

  await db.schema
    .createTable('devices')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('manufacturer', 'varchar(255)', (col) => col.notNull())
    .addColumn('test_availability', 'jsonb', (col) => col.notNull())
    .execute()

  //Todo: We should set patterns for serial
  await db.schema
    .createTable('facility_devices')
    .addColumn('created_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamptz', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('device_serial', 'serial', (col) => col.primaryKey())
    .addColumn('device_id', 'integer', (col) =>
      col.notNull().references('devices.id').onDelete('cascade')
    )
    .addColumn('room_id', 'integer', (col) =>
      col.notNull().references('facility_rooms.id').onDelete('cascade')
    )
    .execute()

  await db.schema
    .createTable('medical_tests')
    .addColumn('name', 'varchar(255)', (col) => col.primaryKey().notNull())
    .execute()

  await addUpdatedAtTrigger(db, 'facility_rooms')
  await seedDataFromJSON(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('facility_devices').execute()
  await db.schema.dropTable('facility_rooms').execute()
  await db.schema.dropTable('devices').execute()
  await db.schema.dropTable('medical_tests').execute()
}

async function seedDataFromJSON(db: Kysely<any>) {
  const tests: { name: string }[] = await parseJSON(
    './db/resources/medical_tests.json'
  )
  const devices: {
    name: string
    manufacturer: string
    tests: { name: string }
  }[] = await parseJSON('./db/resources/devices.json')

  await db.insertInto('devices').values(uniq(devices)).execute()
  await db.insertInto('medical_tests').values(uniq(tests)).execute()
}
