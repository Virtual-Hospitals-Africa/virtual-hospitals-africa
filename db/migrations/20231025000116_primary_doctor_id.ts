import { Kysely } from "kysely";

export function up(db: Kysely<unknown>) {
  return db.schema
    .alterTable('patients')
    .addColumn('primary_doctor_id', 'integer', (col) => col.references('health_workers.id'))
    .execute()
}

export function down(db: Kysely<unknown>) {
  return db.schema
    .alterTable('patients')
    .dropColumn('primary_doctor_id')
    .execute()
}
