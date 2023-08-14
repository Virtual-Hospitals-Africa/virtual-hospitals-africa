import { Kysely } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

const countryList = ['Zimbabwe']

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('countries')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addUniqueConstraint('country_name', ['name'])
    .execute()

  await addUpdatedAtTrigger(db, 'countries')
  await addCountries(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema
    .dropTable('countries').execute()
}

async function addCountries(db: Kysely<any>) {
  await db
    .insertInto('countries')
    .values(countryList.map((name) => ({ name })))
    .execute()
}