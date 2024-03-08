//rename file!

import { Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from '../addUpdatedAtTrigger.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createTable('patient_lifestyle')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn('patient_id', 'integer', (col) =>
      col
        .notNull()
        .references('patients.id')
        .unique()
        .onDelete('cascade'))
    .addColumn('sexual_activity', 'json')
    .addColumn('alcohol', 'json')
    .addColumn('smoking', 'json')
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
  await addUpdatedAtTrigger(db, 'patient_lifestyle')
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_lifestyle').execute()
}
