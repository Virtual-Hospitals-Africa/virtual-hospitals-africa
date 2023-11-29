import { Kysely, sql } from 'kysely'
import parseJSON from '../../util/parseJSON.ts'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('medications')
    .addColumn('key_id', 'varchar(255)', (col) => col.primaryKey())
    .addColumn('trade_name', 'varchar(512)', (col) => col.notNull())
    .addColumn('generic_name', 'varchar(255)')
    .addColumn('forms', 'varchar(255)')
    .addColumn('strength', 'varchar(255)')
    .addColumn('category', 'varchar(255)')
    .addColumn('registration_no', 'varchar(255)', (col) => col.notNull())
    .addColumn('applicant_name', 'varchar(255)')
    .addColumn('manufacturers', 'varchar(1024)')
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .execute()

  await db.schema
    .createTable('patient_condition_medications')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('created_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('updated_at', 'timestamp', (col) =>
      col.defaultTo(sql`now()`).notNull()
    )
    .addColumn('patient_id', 'integer', (col) =>
      col.notNull().references('patients.id').onDelete('cascade')
    )
    .addColumn('condition_key_id', 'varchar(255)', (col) =>
      col.notNull().references('conditions.key_id').onDelete('cascade')
    )
    .addColumn('medication_key_id', 'varchar(255)', (col) =>
      col.notNull().references('medications.key_id').onDelete('cascade')
    )
    .addColumn('dosage', 'varchar(255)')
    .addColumn('intake_frequency', 'varchar(255)')
    .execute()

  await addUpdatedAtTrigger(db, 'medications')
  await addUpdatedAtTrigger(db, 'patient_condition_medications')
  await seedDataFromJSON(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_condition_medications').execute()
  await db.schema.dropTable('medications').execute()
}

async function seedDataFromJSON(db: Kysely<any>) {
  const data = await parseJSON('./db/resources/list_of_medications.json')

  for (const row of data) {
    await db
      .insertInto('medications')
      .values({
        key_id: row.id,
        trade_name: row.trade_name,
        generic_name: row.generic_name,
        forms: row.forms,
        strength: row.strength,
        category: row.category,
        registration_no: row.registration_no,
        applicant_name: row.applicant_name,
        manufacturers: row.manufacturers,
      })
      .returningAll()
      .executeTakeFirstOrThrow()
  }
}
