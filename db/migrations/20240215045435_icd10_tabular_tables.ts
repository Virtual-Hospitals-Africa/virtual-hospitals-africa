// deno-lint-ignore-file no-explicit-any
import { Kysely, sql } from 'kysely'

async function makeTables(db: Kysely<any>) {
  await db.schema.createTable('icd10_section')
    .addColumn('section', 'varchar(7)', (col) => col.primaryKey())
    .addColumn('description', 'varchar(255)', (col) => col.notNull())
    .execute()

  await db.schema.createTable('icd10_category')
    .addColumn('category', 'varchar(3)', (col) => col.primaryKey())
    .addColumn(
      'section',
      'varchar(8)',
      (col) =>
        col.notNull().references('icd10_section.section').onDelete('cascade'),
    )
    .addColumn('description', 'varchar(255)', (col) => col.notNull())
    .execute()

  await db.schema.createTable('icd10_diagnosis')
    .addColumn('code', 'varchar(8)', (col) => col.primaryKey())
    .addColumn(
      'category',
      'varchar(3)',
      (col) =>
        col.notNull().references('icd10_category.category').onDelete('cascade'),
    )
    .addColumn('description', 'varchar(255)', (col) => col.notNull())
    .addColumn('includes', 'text')
    .addColumn(
      'parent_code',
      'varchar(8)',
      (col) => col.references('icd10_diagnosis.code').onDelete('cascade'),
    )
    .addColumn('general', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute()

  await db.schema.createTable('icd10_diagnosis_exclude')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'code',
      'varchar(8)',
      (col) =>
        col.notNull().references('icd10_diagnosis.code').onDelete('cascade'),
    )
    .addColumn('note', 'varchar(255)', (col) => col.notNull())
    .addColumn('pure', 'boolean', (col) => col.notNull())
    .execute()

  await db.schema.createTable('icd10_diagnosis_exclude_category')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'exclude_id',
      'integer',
      (col) =>
        col.notNull().references('icd10_diagnosis_exclude.id').onDelete(
          'cascade',
        ),
    )
    .addColumn(
      'category',
      'varchar(3)',
      (col) =>
        col.notNull().references('icd10_category.category').onDelete('cascade'),
    )
    .execute()

  await db.schema.createTable('icd10_diagnosis_exclude_code')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'exclude_id',
      'integer',
      (col) =>
        col.notNull().references('icd10_diagnosis_exclude.id').onDelete(
          'cascade',
        ),
    )
    .addColumn(
      'code',
      'varchar(8)',
      (col) =>
        col.notNull().references('icd10_diagnosis.code').onDelete('cascade'),
    )
    .addColumn('dash', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute()

  await db.schema.createTable('icd10_diagnosis_exclude_code_range')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'exclude_id',
      'integer',
      (col) =>
        col.notNull().references('icd10_diagnosis_exclude.id').onDelete(
          'cascade',
        ),
    )
    .addColumn(
      'code_range_start',
      'varchar(8)',
      (col) =>
        col.notNull().references('icd10_diagnosis.code').onDelete('cascade'),
    )
    .addColumn(
      'code_range_end',
      'varchar(8)',
      (col) =>
        col.notNull().references('icd10_diagnosis.code').onDelete('cascade'),
    )
    .addColumn(
      'code_range_start_dash',
      'boolean',
      (col) => col.notNull().defaultTo(false),
    )
    .addColumn(
      'code_range_end_dash',
      'boolean',
      (col) => col.notNull().defaultTo(false),
    )
    .execute()

  await sql`
    CREATE INDEX trgm_icd10_diagnosis_description ON icd10_diagnosis USING GIN ("description" gin_trgm_ops);
    CREATE INDEX trgm_icd10_diagnosis_includes ON icd10_diagnosis USING GIN ("includes" gin_trgm_ops);
  `.execute(db)
}

export async function up(db: Kysely<any>) {
  await makeTables(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('icd10_diagnosis_exclude_code').execute()
  await db.schema.dropTable('icd10_diagnosis_exclude_code_range').execute()
  await db.schema.dropTable('icd10_diagnosis_exclude_category').execute()
  await db.schema.dropTable('icd10_diagnosis_exclude').execute()
  await db.schema.dropTable('icd10_diagnosis').execute()
  await db.schema.dropTable('icd10_category').execute()
  await db.schema.dropTable('icd10_section').execute()
}
