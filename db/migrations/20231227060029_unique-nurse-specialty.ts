import { Kysely } from "kysely";

export function up(db: Kysely<unknown>) {
  return db.schema.alterTable('nurse_specialties')
    .addUniqueConstraint('nurse_specialty_employee_id', ['employee_id'])
    .execute()
}

export function down(db: Kysely<unknown>) {
  return db.schema.alterTable('nurse_specialties')
    .dropConstraint('nurse_specialty_employee_id')
    .execute()
}
