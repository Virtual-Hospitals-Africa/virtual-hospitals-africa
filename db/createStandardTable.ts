import { CreateTableBuilder, Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from './addUpdatedAtTrigger.ts'
import { now } from './helpers.ts'
import { DataTypeExpression } from 'kysely/parser/data-type-parser.js'

export async function createTableWithTimestamps(
  // deno-lint-ignore no-explicit-any
  db: Kysely<any>,
  table: string,
  callback: (
    builder: CreateTableBuilder<string, never>,
  ) => CreateTableBuilder<string, never>,
) {
  await callback(db.schema.createTable(table))
    .addColumn(
      'created_at',
      'timestamptz',
      (col) => col.defaultTo(now).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamptz',
      (col) => col.defaultTo(now).notNull(),
    ).execute()

  await addUpdatedAtTrigger(db, table)
}

export async function createStandardTable(
  // deno-lint-ignore no-explicit-any
  db: Kysely<any>,
  table: string,
  callback: (
    builder: CreateTableBuilder<string, never>,
  ) => CreateTableBuilder<string, never>,
  opts?: {
    id_type: DataTypeExpression
  },
) {
  const creating_table = db.schema.createTable(table)
    .addColumn(
      'id',
      opts?.id_type || 'uuid',
      (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
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
