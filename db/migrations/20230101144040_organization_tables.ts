import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await sql`
    ALTER TABLE "Organization"
    ADD CONSTRAINT "check_single_name" CHECK (array_length("name", 1) = 1)
  `.execute(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema.alterTable('Organization').dropConstraint('check_single_name')
    .execute()
}
