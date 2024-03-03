import { CreateTableBuilder, Kysely } from 'kysely'
import { addUpdatedAtTrigger } from './addUpdatedAtTrigger.ts'
import { now } from './helpers.ts'

export async function standardTable(
  // deno-lint-ignore no-explicit-any
  db: Kysely<any>,
  table: string,
  callback: (
    builder: CreateTableBuilder<string, never>,
  ) => CreateTableBuilder<string, never>,
) {
  const creating_table = db.schema.createTable(table)
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'created_at',
      'timestamptz',
      (col) => col.defaultTo(now).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamptz',
      (col) => col.defaultTo(now).notNull(),
    )

  await callback(creating_table).execute()
  await addUpdatedAtTrigger(db, table)
}
