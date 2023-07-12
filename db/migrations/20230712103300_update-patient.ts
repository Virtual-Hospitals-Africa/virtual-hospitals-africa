import { Kysely } from 'kysely'

export async function up(db: Kysely<unknown>) {
  await db
    .schema
    .alterTable('patients')
    .dropColumn('avatar_url')
    .addColumn(
      'avatar_media_id',
      'integer',
      (col) => col.references('media.id'),
    )
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db
    .schema
    .alterTable('patients')
    .dropColumn('avatar_media_id')
    .addColumn('avatar_url', 'varchar(255)')
    .execute()
}
