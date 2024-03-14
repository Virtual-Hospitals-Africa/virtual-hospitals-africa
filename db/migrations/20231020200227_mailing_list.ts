import { Kysely } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export function up(db: Kysely<unknown>) {
  return createStandardTable(
    db,
    'mailing_list',
    (qb) =>
      qb.addColumn('name', 'varchar(255)', (col) => col.notNull())
        .addColumn('email', 'varchar(255)', (col) => col.notNull())
        .addColumn('entrypoint', 'varchar(255)', (col) => col.notNull())
        .addColumn('message', 'text')
        .addColumn('support', 'varchar(255)')
        .addColumn('interest', 'varchar(255)')
        .addUniqueConstraint('mailing_list_email', ['email']),
  )
}

export function down(db: Kysely<unknown>) {
  return db.schema.dropTable('mailing_list').execute()
}
