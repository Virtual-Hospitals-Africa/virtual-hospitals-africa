import { ColumnDataType, CreateTableBuilder, Kysely, sql } from 'kysely'
import { addUpdatedAtTrigger } from './addUpdatedAtTrigger.ts'
import { now } from './helpers.ts'

export async function createStandardTable(
  // deno-lint-ignore no-explicit-any
  db: Kysely<any>,
  table: string,
  callback: (
    builder: CreateTableBuilder<string, never>,
  ) => CreateTableBuilder<string, never>,
) {
  const creating_table = db.schema.createTable(table)
    .addColumn(
      'id',
      'uuid',
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

export async function createPointerTable(
  // deno-lint-ignore no-explicit-any
  db: Kysely<any>,
  table: string,
  {
    references,
    primary_key_type,
    primary_key_column_name = 'id',
    include_created_at = false,
    include_updated_at = false,
  }: {
    references: string
    primary_key_type: ColumnDataType
    primary_key_column_name?: string
    include_created_at?: boolean
    include_updated_at?: boolean
  },
  callback: (
    builder: CreateTableBuilder<string, never>,
  ) => CreateTableBuilder<string, never> = (qb) => qb,
) {
  if (!references.includes('.')) {
    references = references + '.id'
  }

  let creating_table = db.schema.createTable(table)
    .addColumn(
      primary_key_column_name,
      primary_key_type,
      (col) => col.primaryKey().references(references).onDelete('cascade'),
    )

  if (include_created_at) {
    creating_table = creating_table.addColumn(
      'created_at',
      'timestamptz',
      (col) => col.defaultTo(now).notNull(),
    )
  }

  if (include_updated_at) {
    creating_table = creating_table.addColumn(
      'updated_at',
      'timestamptz',
      (col) => col.defaultTo(now).notNull(),
    )
  }

  await callback(creating_table).execute()

  if (include_updated_at) {
    await addUpdatedAtTrigger(db, table)
  }
}
