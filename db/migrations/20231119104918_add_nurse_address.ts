import { Kysely } from 'kysely'

export function up(db: Kysely<unknown>) {
  return db.schema
    .alterTable('nurse_registration_details')
    .addColumn('address_id', 'integer', (col) =>
      col
        .references('address.id')
        .onDelete('set null'))
    .execute()
}

export function down(db: Kysely<unknown>) {
  return db.schema
    .alterTable('nurse_registration_details')
    .dropColumn('address_id')
    .execute()
}
