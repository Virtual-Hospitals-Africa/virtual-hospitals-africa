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

export async function createStandardTablePartitionedByPatientId(
  // deno-lint-ignore no-explicit-any
  db: Kysely<any>,
  table: string,
  callback: (
    builder: CreateTableBuilder<string, never>,
  ) => CreateTableBuilder<string, never>,
) {
  // Build the table definition using Kysely's builder, but we'll compile it to SQL
  // and modify it to add partitioning
  const creating_table = db.schema.createTable(table)
    .addColumn(
      'id',
      'uuid',
      (col) => col.notNull().defaultTo(sql`gen_random_uuid()`),
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
    .addColumn(
      'patient_id',
      'uuid',
      (col) => col.notNull().references('patients.id').onDelete('cascade'),
    )
    .addPrimaryKeyConstraint(`${table}_primary_key`, ['id', 'patient_id'])

  const with_columns = callback(creating_table)
    .modifyEnd(sql` PARTITION BY HASH (patient_id);`)

  await with_columns.execute()

  await addUpdatedAtTrigger(db, table)
}

export async function createPointerTablePartitionedByPatientId(
  // deno-lint-ignore no-explicit-any
  db: Kysely<any>,
  table: string,
  {
    references,
    include_created_at = false,
    include_updated_at = false,
  }: {
    references: string
    include_created_at?: boolean
    include_updated_at?: boolean
  },
  callback: (
    builder: CreateTableBuilder<string, never>,
  ) => CreateTableBuilder<string, never> = (qb) => qb,
) {
  // Parse the references parameter to extract table name
  // It can be either "table_name" or "table_name.column_name"
  let referencedTable: string
  let referencedColumns: string[]

  if (references.includes('.')) {
    // If it includes a dot, split into table and column
    const [tableName, columnName] = references.split('.')
    referencedTable = tableName
    referencedColumns = [columnName, 'patient_id']
  } else {
    // If no dot, assume it references the 'id' column
    referencedTable = references
    referencedColumns = ['id', 'patient_id']
  }

  // Build the table with Kysely
  let creating_table = db.schema.createTable(table)
    .addColumn(
      'id',
      'uuid',
      (col) => col.notNull(),
    )
    .addColumn(
      'patient_id',
      'uuid',
      (col) => col.notNull(),
    )
    .addPrimaryKeyConstraint(`${table}_primary_key`, ['id', 'patient_id'])
    .addForeignKeyConstraint(
      `fk_${table}_id_patient_id`, // Constraint name
      ['id', 'patient_id'], // Local columns
      referencedTable, // Target table (without column)
      referencedColumns, // Target columns
      (cb) => cb.onDelete('cascade'), // Optional: actions
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

  const with_columns = callback(creating_table)
    .modifyEnd(sql` PARTITION BY HASH (patient_id);`)

  await with_columns.execute()

  if (include_updated_at) {
    await addUpdatedAtTrigger(db, table)
  }
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
