import { Kysely } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('patient_occupations')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('patient_id', 'integer', (col) =>
      col
        .notNull()
        .references('patients.id'))
    .addColumn('school', 'json') //All Information Collect
    .addColumn('job', 'json')
    .execute()
  await addUpdatedAtTrigger(db, 'patient_occupations')

  // await db.schema
  // .createTable('patient_occupations')
  // .addColumn('id', 'serial', (col) => col.primaryKey())
  // .addColumn('school', 'json') //All Information Collect
  // .execute()
  //  await addUpdatedAtTrigger(db, 'patient_occupations')
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_occupations').execute()
}
