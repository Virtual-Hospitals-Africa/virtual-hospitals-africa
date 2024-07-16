import { Kysely } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export function up(db: Kysely<unknown>) {
  return createStandardTable(db, 'prescriptions', (qb) =>
    qb
      .addColumn(
        'phone_number',
        'varchar(255)',
        (col) => col.notNull().unique(),
      )
      .addColumn('alphanumeric_code', 'varchar(255)')
      .addColumn('contents', 'text', (col) => col.notNull()))
}

export function down(db: Kysely<unknown>) {
  return db.schema.dropTable('prescriptions').execute()
}
