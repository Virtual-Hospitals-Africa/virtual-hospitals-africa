import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createType('age_unit')
    .asEnum([
      'day',
      'week',
      'month',
      'year',
    ])
    .execute()

  await sql`
    CREATE TYPE age AS (
      number INTEGER,
      unit AGE_UNIT
    )
  `.execute(db)

  await sql`
    CREATE VIEW patient_age AS

    WITH a1 AS (
      SELECT id,
             AGE(CURRENT_DATE, date_of_birth) as age,
             CURRENT_DATE::timestamp - date_of_birth::timestamp as diff
        from patients
       WHERE date_of_birth IS NOT NULL
    ),

    a2 AS (
      SELECT id AS patient_id,
        CASE WHEN age >= INTERVAL '2 years'
          THEN (EXTRACT(YEAR FROM age), 'year')::AGE
        WHEN age >= INTERVAL '3 months'
          THEN (EXTRACT(YEAR FROM age) * 12 + EXTRACT(MONTH FROM age), 'month')::AGE
        WHEN age >= interval '21 days'
          THEN (
            TRUNC(DATE_PART('day', diff) / 7),
            'week'
          )::AGE
        ELSE
          (DATE_PART('day', diff),
          'day'
        )::AGE END AS age
      FROM a1
    )

    SELECT
      patient_id,
      age,
      (age).number AS age_number,
      (age).unit AS age_unit,
      (age).number::TEXT || ' ' || (age).unit::TEXT || (CASE WHEN (age).number = 1 THEN '' ELSE 's' END) AS age_display
    FROM a2
    WHERE age IS NOT NULL
  `.execute(db)
}

export async function down(db: Kysely<unknown>) {
  await sql`DROP VIEW patient_age`.execute(db)
  await db.schema.dropType('age').execute()
  await db.schema.dropType('age_unit').execute()
}
