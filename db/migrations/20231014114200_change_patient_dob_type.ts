import { Kysely } from 'kysely'

export function up(db: Kysely<unknown>) {
  return db.schema
    .alterTable('patients')
    .dropColumn('date_of_birth')
    .addColumn('date_of_birth', 'date')
    .execute()
}

export function down(db: Kysely<unknown>) {
  return db.schema
    .alterTable('patients')
    .dropColumn('date_of_birth')
    .addColumn('date_of_birth', 'varchar(50)')
    .execute()
}
