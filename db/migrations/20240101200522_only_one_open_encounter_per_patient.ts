import { Kysely, sql } from 'kysely'

export function up(db: Kysely<unknown>) {
  return sql`
    ALTER TABLE patient_encounters
    ADD CONSTRAINT only_one_open_encounter_per_patient
    UNIQUE NULLS NOT DISTINCT (patient_id, closed_at)
  `.execute(db)
}

export function down(db: Kysely<unknown>) {
  return db.schema
    .alterTable('patient_encounters')
    .dropConstraint('only_one_open_encounter_per_patient')
    .execute()
}
