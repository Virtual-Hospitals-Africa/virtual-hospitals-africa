import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await sql`
    ALTER TABLE nurse_registration_details ADD COLUMN address VARCHAR(255)
  `.execute(db)
}

export async function down(db: Kysely<unknown>) {
  await sql`
    ALTER TABLE nurse_registration_details ADD COLUMN address VARCHAR(255)
  `.execute(db)
}
