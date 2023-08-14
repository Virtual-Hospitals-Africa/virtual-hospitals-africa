import { Kysely } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

const provinceList = [
  'Bulawayo',
  'Harare',
  'Manicaland',
  'Mashonaland Central',
  'Mashonaland East',
  'Mashonaland West',
  'Masvingo',
  'Matabeleland North',
  'Matabeleland South',
  'Midlands'
]

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('provinces')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('country_id', 'integer', (col) =>
      col.notNull()
        .references('countries.id')
        .onDelete('cascade'))
    .addUniqueConstraint('province_name', ['name'])
    .execute()

  await addUpdatedAtTrigger(db, 'provinces')
  await addProvinces(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema
    .dropTable('provinces').execute()
}

async function addProvinces(db: Kysely<any>) {
  await db
    .insertInto('provinces')
    .values(provinceList.map((name) => ({
      name,
      country_id: 1
    })))
    .execute()
}