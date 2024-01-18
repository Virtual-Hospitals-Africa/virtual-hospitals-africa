import { Kysely, sql } from 'kysely'

export function up(db: Kysely<unknown>) {
  return db.schema
    .alterTable('media')
    .addColumn(
      'uuid',
      'uuid',
      (column) => column.notNull().unique().defaultTo(sql`gen_random_uuid()`),
    )
    .execute()
}

export function down(db: Kysely<unknown>) {
  return db.schema
    .alterTable('media')
    .dropColumn('uuid')
    .execute()
}
