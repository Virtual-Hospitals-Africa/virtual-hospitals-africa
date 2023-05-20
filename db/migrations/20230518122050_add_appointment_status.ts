import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await db.schema
    .createType('status')
    .asEnum(['pending', 'confirmed', 'denied'])
    .execute()

  await db.schema
    .alterTable('appointments')
    .addColumn('status', sql`status`, (column) => column.defaultTo('pending'))
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.alterTable('appointments').dropColumn('status').execute()
  await db.schema.dropType('status').execute()
}
