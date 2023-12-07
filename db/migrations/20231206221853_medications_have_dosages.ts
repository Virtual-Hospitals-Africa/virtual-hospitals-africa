//deno-lint-ignore-file no-explicit-any
import { Kysely } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .alterTable('patient_condition_medications')
    .alterColumn('dosage', (col) => col.setNotNull())
    .alterColumn('intake_frequency', (col) => col.setNotNull())
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema
    .alterTable('patient_condition_medications')
    .alterColumn('dosage', (col) => col.dropNotNull())
    .alterColumn('intake_frequency', (col) => col.dropNotNull())
    .execute()
}
