import { Kysely, sql } from 'kysely'

// deno-lint-ignore no-explicit-any
export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('icd9_icd10')
    .addColumn(
      'created_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'updated_at',
      'timestamptz',
      (col) => col.defaultTo(sql`now()`).notNull(),
    )
    .addColumn(
      'icd9_code',
      'varchar(255)',
      (col) => col.notNull(),
    )
    .addColumn(
      'icd10_code',
      'varchar(255)',
    )
    .addColumn(
      'approximate',
      'boolean',
      (col) => col.notNull(),
    )
    .addColumn(
      'no_map',
      'boolean',
      (col) => col.notNull(),
    )
    .addColumn(
      'combination',
      'boolean',
      (col) => col.notNull(),
    )
    .addColumn(
      'scenario',
      'int2',
      (col) => col.notNull(),
    )
    .addColumn(
      'choice_list',
      'boolean',
      (col) => col.notNull(),
    )
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('icd9_icd10').execute()
}
