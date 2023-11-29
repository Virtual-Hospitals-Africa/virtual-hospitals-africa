import { Kysely, sql } from 'kysely'

export function up(db: Kysely<unknown>) {
  return sql`
    ALTER TABLE patients
    ADD CONSTRAINT one_primary_doctor
    CHECK (
        (primary_doctor_id IS NOT NULL AND unregistered_primary_doctor_name IS NULL) OR
        (primary_doctor_id IS NULL AND unregistered_primary_doctor_name IS NOT NULL) OR
        (primary_doctor_id IS NULL AND unregistered_primary_doctor_name IS NULL)
    )
  `.execute(db)
}

export function down(db: Kysely<unknown>) {
  return sql`
    ALTER TABLE patients
    DROP CONSTRAINT one_primary_doctor
  `.execute(db)
}
