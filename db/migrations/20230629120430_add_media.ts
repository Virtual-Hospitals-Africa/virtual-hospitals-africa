import { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await db.schema.createTable('test_add_media')
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('test_add_media')
}
