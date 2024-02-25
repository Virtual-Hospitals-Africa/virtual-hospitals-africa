// deno-lint-ignore-file no-explicit-any
import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>) {
  await db.schema.createTable('icd10_sections')
    .addColumn('section', 'varchar(7)', (col) => col.primaryKey())
    .addColumn('description', 'varchar(255)', (col) => col.notNull())
    .execute()

  await db.schema.createTable('icd10_categories')
    .addColumn('category', 'varchar(3)', (col) => col.primaryKey())
    .addColumn(
      'section',
      'varchar(8)',
      (col) =>
        col.notNull().references('icd10_sections.section').onDelete('cascade'),
    )
    .addColumn('description', 'varchar(255)', (col) => col.notNull())
    .execute()

  await db.schema.createTable('icd10_diagnoses')
    .addColumn('code', 'varchar(8)', (col) => col.primaryKey())
    .addColumn(
      'category',
      'varchar(3)',
      (col) =>
        col.notNull().references('icd10_categories.category').onDelete(
          'cascade',
        ),
    )
    .addColumn('description', 'varchar(255)', (col) => col.notNull())
    .addColumn('description_vector', sql`tsvector`, (col) => col.notNull())
    .addColumn(
      'parent_code',
      'varchar(8)',
      (col) => col.references('icd10_diagnoses.code').onDelete('cascade'),
    )
    .addColumn('general', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute()

  await db.schema.createTable('icd10_diagnoses_includes')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'code',
      'varchar(8)',
      (col) =>
        col.notNull().references('icd10_diagnoses.code').onDelete('cascade'),
    )
    .addColumn('note', 'text', (col) => col.notNull())
    .addColumn('note_vector', sql`tsvector`, (col) => col.notNull())
    .addColumn('sourced_from_index', 'boolean', (col) => col.notNull())
    .execute()

  await db.schema.createTable('icd10_diagnoses_excludes')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'code',
      'varchar(8)',
      (col) =>
        col.notNull().references('icd10_diagnoses.code').onDelete('cascade'),
    )
    .addColumn('note', 'text', (col) => col.notNull())
    .addColumn('pure', 'boolean', (col) => col.notNull())
    .execute()

  await db.schema.createTable('icd10_diagnoses_excludes_categories')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'exclude_id',
      'integer',
      (col) =>
        col.notNull().references('icd10_diagnoses_excludes.id').onDelete(
          'cascade',
        ),
    )
    .addColumn(
      'category',
      'varchar(3)',
      (col) =>
        col.notNull().references('icd10_categories.category').onDelete(
          'cascade',
        ),
    )
    .execute()

  await db.schema.createTable('icd10_diagnoses_excludes_codes')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'exclude_id',
      'integer',
      (col) =>
        col.notNull().references('icd10_diagnoses_excludes.id').onDelete(
          'cascade',
        ),
    )
    .addColumn(
      'code',
      'varchar(8)',
      (col) =>
        col.notNull().references('icd10_diagnoses.code').onDelete('cascade'),
    )
    .addColumn('dash', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute()

  await db.schema.createTable('icd10_diagnoses_excludes_code_ranges')
    .addColumn('id', 'serial', (col) => col.primaryKey())
    .addColumn(
      'exclude_id',
      'integer',
      (col) =>
        col.notNull().references('icd10_diagnoses_excludes.id').onDelete(
          'cascade',
        ),
    )
    .addColumn(
      'code_range_start',
      'varchar(8)',
      (col) =>
        col.notNull().references('icd10_diagnoses.code').onDelete('cascade'),
    )
    .addColumn(
      'code_range_end',
      'varchar(8)',
      (col) =>
        col.notNull().references('icd10_diagnoses.code').onDelete('cascade'),
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
    CREATE OR REPLACE FUNCTION icd10_diagnoses_description_tsvector_trigger()
    RETURNS trigger AS $$
      begin
        new.description_vector :=
          to_tsvector('english', new.description);
        return new;
      end
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER icd10_diagnoses_description_tsvector_update
      BEFORE INSERT OR UPDATE
      ON icd10_diagnoses
      FOR EACH ROW EXECUTE
      PROCEDURE icd10_diagnoses_description_tsvector_trigger();
  `.execute(db)

  await sql`
    CREATE OR REPLACE FUNCTION icd10_diagnoses_includes_note_tsvector_trigger()
    RETURNS trigger AS $$
      begin
        new.note_vector :=
          to_tsvector('english', new.note);
        return new;
      end
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER icd10_diagnoses_includes_note_tsvector_update
      BEFORE INSERT OR UPDATE
      ON icd10_diagnoses_includes
      FOR EACH ROW EXECUTE 
      PROCEDURE icd10_diagnoses_includes_note_tsvector_trigger();
  `.execute(db)

  await sql`
    CREATE INDEX ts_icd10_diagnoses_description
    ON icd10_diagnoses
    USING GIN ("description_vector");
  `.execute(db)

  await sql`
    CREATE INDEX ts_icd10_diagnoses_includes_note
    ON icd10_diagnoses_includes
    USING GIN ("note_vector");
  `.execute(db)
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('icd10_diagnoses_excludes_codes').execute()
  await db.schema.dropTable('icd10_diagnoses_excludes_code_ranges').execute()
  await db.schema.dropTable('icd10_diagnoses_excludes_categories').execute()
  await db.schema.dropTable('icd10_diagnoses_excludes').execute()
  await db.schema.dropTable('icd10_diagnoses_includes').execute()
  await db.schema.dropTable('icd10_diagnoses').execute()
  await db.schema.dropTable('icd10_categories').execute()
  await db.schema.dropTable('icd10_sections').execute()
  await sql`DROP FUNCTION icd10_diagnoses_description_tsvector_trigger`.execute(
    db,
  )
  await sql`DROP FUNCTION icd10_diagnoses_includes_note_tsvector_trigger`
    .execute(db)
}
