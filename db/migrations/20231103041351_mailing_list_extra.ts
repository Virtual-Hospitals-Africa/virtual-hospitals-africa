import { Kysely } from 'kysely'

export function up(db: Kysely<unknown>) {
  return db.schema.alterTable('mailing_list')
    .addColumn('message', 'text')
    .addColumn('support', 'varchar(255)')
    .addColumn('interest', 'varchar(255)')
    .execute()
}

export function down(db: Kysely<unknown>) {
  return db.schema.alterTable('mailing_list')
    .dropColumn('message')
    .dropColumn('support')
    .dropColumn('interest')
    .execute()
}
