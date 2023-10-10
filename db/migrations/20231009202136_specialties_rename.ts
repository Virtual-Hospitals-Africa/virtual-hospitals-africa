import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await sql`
    ALTER TABLE nurse_specialities RENAME TO nurse_specialties
  `.execute(db)

  await sql`
    ALTER TABLE nurse_specialties RENAME COLUMN speciality TO specialty
  `.execute(db)

  await sql`
    ALTER TYPE nurse_speciality RENAME TO nurse_specialty
  `.execute(db)
}

export async function down(db: Kysely<unknown>) {
  await sql`
    ALTER TYPE nurse_specialty RENAME TO nurse_speciality
  `.execute(db)

  await sql`
    ALTER TABLE nurse_specialties RENAME COLUMN specialty TO speciality
  `.execute(db)

  await sql`
    ALTER TABLE nurse_specialties RENAME TO nurse_specialities
  `.execute(db)
}
