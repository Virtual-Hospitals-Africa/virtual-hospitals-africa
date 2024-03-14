//deno-lint-ignore-file no-explicit-any
import { Kysely } from 'kysely'
import parseJSON from '../../util/parseJSON.ts'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('allergies')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .execute()

  await createStandardTable(db, 'patient_allergies', (qb) =>
    qb.addColumn(
      'allergy_id',
      'integer',
      (col) => col.notNull().references('allergies.id').onDelete('cascade'),
    )
      .addColumn(
        'patient_id',
        'integer',
        (col) => col.notNull().references('patients.id').onDelete('cascade'),
      )
      .addUniqueConstraint('patient_allergy', ['allergy_id', 'patient_id']))

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
