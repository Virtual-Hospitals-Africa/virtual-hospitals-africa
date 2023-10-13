import { Kysely } from "kysely";

export async function up(db: Kysely<unknown>) {
  await db
  .schema
  .alterTable('nurse_registration_details')
  .addColumn('date_of_birth', 'date', (column) => column.notNull())
  .execute()
}

export async function down(db: Kysely<unknown>) {
  await db
  .schema
  .alterTable('nurse_registration_details')
  .dropColumn('date_of_birth')
  .execute()
}
