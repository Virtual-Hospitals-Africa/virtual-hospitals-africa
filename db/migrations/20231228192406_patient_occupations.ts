import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('patient_occupations')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('patient_id', 'integer', (col) =>
      col
        .notNull()
        .references('patients.id')
        .onDelete('cascade'))
    .addColumn('occupation', 'json')
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
    .addUniqueConstraint('patient_id', ['patient_id'])
    .execute()

  await addUpdatedAtTrigger(db, 'patient_occupations')

  //change migration date
  //Created at and updated at columns
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_occupations').execute()
}
