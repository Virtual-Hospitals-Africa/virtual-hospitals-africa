//deno-lint-ignore-file no-explicit-any
import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'
import parseJSON from '../../util/parseJSON.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('allergies')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn(
      'created_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .execute()

  await db.schema
    .createTable('patient_allergies')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'created_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'allergy_id',
      'integer',
      (col) => col.notNull().references('allergies.id').onDelete('cascade'),
    )
    .addColumn(
      'patient_id',
      'integer',
      (col) => col.notNull().references('patients.id').onDelete('cascade'),
    )
    .addUniqueConstraint('patient_allergy', ['allergy_id', 'patient_id'])
    .execute()

  await addUpdatedAtTrigger(db, 'patient_allergies')
  await addUpdatedAtTrigger(db, 'allergies')
  await seedDataFromJSON(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_allergies').execute()
  await db.schema.dropTable('allergies').execute()
}

async function seedDataFromJSON(db: Kysely<any>) {
  const data: { name: string; type: string }[] = await parseJSON(
    './db/resources/allergies.json',
  )

  await db
    .insertInto('allergies')
    .values(data.map((c) => ({ name: c.name })))
    .executeTakeFirstOrThrow()
}
