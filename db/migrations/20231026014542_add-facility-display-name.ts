import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await sql`
    ALTER TABLE facilities ADD display_name TEXT GENERATED ALWAYS AS (name || ' ' || category) STORED
  `.execute(db)
}

export async function down(db: Kysely<unknown>) {
  await sql`
    ALTER TABLE facilities DROP COLUMN display_name
  `.execute(db)
}
