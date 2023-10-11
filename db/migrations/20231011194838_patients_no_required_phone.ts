import { Kysely } from 'kysely'

export function up(db: Kysely<unknown>) {
  return db.schema
    .alterTable('patients')
    .alterColumn('phone_number', (col) => col.dropNotNull())
    .execute()
}

export function down(db: Kysely<unknown>) {
  return db.schema
    .alterTable('patients')
    .alterColumn('phone_number', (col) => col.setNotNull())
    .execute()
}
