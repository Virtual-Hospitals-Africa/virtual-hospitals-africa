import { Kysely } from 'kysely'

export function up(db: Kysely<unknown>) {
  return db.schema
    .alterTable('patients')
    .addColumn('unregistered_primary_doctor_name', 'varchar(255)')
    .execute()
}

export function down(db: Kysely<unknown>) {
  return db.schema
    .alterTable('patients')
    .dropColumn('unregistered_primary_doctor_name')
    .execute()
}
