import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createType('age_units')
    .asEnum([
      'days',
      'weeks',
      'months',
      'years',
    ])
    .execute()

  await sql`
    CREATE TYPE age AS (
      number INTEGER,
      units AGE_UNITS
    )
  `.execute(db)

  await sql`
    CREATE VIEW patient_age AS
    SELECT
      id AS patient_id,
      CASE
        WHEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) >= 2 THEN
          (EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)), 'years')::AGE
        WHEN EXTRACT(year FROM AGE(CURRENT_DATE, date_of_birth)) * 12 + EXTRACT(MONTH FROM AGE(CURRENT_DATE, date_of_birth)) >= 3 THEN
          (EXTRACT(year FROM AGE(CURRENT_DATE, date_of_birth)) * 12 + EXTRACT(MONTH FROM AGE(CURRENT_DATE, date_of_birth)), 'months')::AGE
        WHEN DATE_PART('day', CURRENT_DATE::timestamp - date_of_birth::timestamp) >= 21 THEN
          (TRUNC(DATE_PART('day', CURRENT_DATE::timestamp - date_of_birth::timestamp)/7), 'weeks')::AGE
        ELSE
          (DATE_PART('day', CURRENT_DATE::timestamp - date_of_birth::timestamp), 'days')::AGE
      END AS age
    FROM patients
  `.execute(db)
}

export async function down(db: Kysely<unknown>) {
  await sql`DROP VIEW patient_age`.execute(db)
  await db.schema.dropType('age').execute()
  await db.schema.dropType('age_units').execute()
}
