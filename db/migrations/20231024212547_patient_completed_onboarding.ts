import { Kysely } from 'kysely'

export function up(db: Kysely<unknown>) {
  return db.schema
    .alterTable('patients')
    .addColumn(
      'completed_intake',
      'boolean',
      (col) => col.notNull().defaultTo(false),
    )
    .execute()
}

export function down(db: Kysely<unknown>) {
  return db.schema
    .alterTable('patients')
    .dropColumn('completed_intake')
    .execute()
}
