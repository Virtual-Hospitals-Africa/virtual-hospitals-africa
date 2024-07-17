import { Kysely } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export function up(db: Kysely<unknown>) {
  return createStandardTable(db, 'prescriptions', (qb) =>
    qb
      .addColumn(
        'alphanumeric_code',
        'varchar(255)',
        (col) => col.notNull().unique(),
      )
      .addColumn('contents', 'text', (col) => col.notNull()))
}

export function down(db: Kysely<unknown>) {
  return db.schema.dropTable('prescriptions').execute()
}
