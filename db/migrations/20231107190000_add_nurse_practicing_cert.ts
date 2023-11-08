import { Kysely } from 'kysely'

export function up(db: Kysely<unknown>) {
  return db.schema
    .alterTable('nurse_registration_details')
    .addColumn('nurse_practicing_cert_media_id', 'integer', (column) =>
      column
        .references('media.id')
        .onDelete('set null'))
    .execute()
}

export function down(db: Kysely<unknown>) {
  return db.schema
    .alterTable('nurse_registration_details')
    .dropColumn('nurse_practicing_cert_media_id')
    .execute()
}
