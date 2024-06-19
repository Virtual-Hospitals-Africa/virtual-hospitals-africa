import { Kysely } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export function up(db: Kysely<unknown>) {
  return createStandardTable(db, 'pharmacists', (table) =>
    table
      .addColumn('registration_number', 'varchar(255)')
      .addColumn('phone_number', 'varchar(255)')
      .addColumn('id_number', 'varchar(255)')
      .addColumn('name', 'varchar(255)')
      .addColumn('pin', 'varchar(255)'))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('pharmacists').execute()
}
