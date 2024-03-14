//deno-lint-ignore-file no-explicit-any
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema
    .createTable('conditions')
    .addColumn('id', 'varchar(255)', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
    .addColumn('term_icd9_code', 'varchar(255)')
    .addColumn('term_icd9_text', 'varchar(255)')
    .addColumn('consumer_name', 'varchar(255)', (col) => col.notNull())
    .addColumn('is_procedure', 'boolean', (col) => col.notNull())
    .addColumn('info_link_href', 'varchar(255)')
    .addColumn('info_link_text', 'varchar(255)')
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
    .execute()

  await db.schema
    .createTable('icd10_codes')
    .addColumn('code', 'varchar(255)', (col) => col.primaryKey())
    .addColumn('name', 'varchar(255)', (col) => col.notNull())
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
    .execute()

  await db.schema
    .createTable('condition_icd10_codes')
    .addColumn('condition_id', 'varchar(255)', (col) =>
      col.notNull()
        .references('conditions.id')
        .onDelete('cascade'))
    .addColumn('icd10_code', 'varchar(255)', (col) =>
      col.notNull()
        .references('icd10_codes.code')
        .onDelete('cascade'))
    .execute()
}

export async function down(db: Kysely<any>) {
  await db.schema.dropTable('condition_icd10_codes').execute()
  await db.schema.dropTable('icd10_codes').execute()
  await db.schema.dropTable('conditions').execute()
}
