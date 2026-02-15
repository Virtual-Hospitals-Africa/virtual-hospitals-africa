import { Kysely, sql } from 'kysely'
import type { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await db.schema.createTable('icd10_sections')
    .addColumn('section', 'varchar(7)', (col) => col.primaryKey())
    .addColumn('description', 'varchar(255)', (col) => col.notNull())
    .execute()

  await db.schema.createTable('icd10_categories')
    .addColumn('category', 'varchar(3)', (col) => col.primaryKey())
    .addColumn(
      'section',
      'varchar(8)',
      (col) => col.notNull().references('icd10_sections.section').onDelete('cascade'),
    )
    .addColumn('description', 'varchar(255)', (col) => col.notNull())
    .execute()

  await db.schema
    .createIndex('idx_icd10_categories_section')
    .on('icd10_categories')
    .column('section')
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

  await db.schema
    .createIndex('idx_icd10_diagnoses_category')
    .on('icd10_diagnoses')
    .column('category')
    .execute()

  await db.schema
    .createIndex('idx_icd10_diagnoses_parent_code')
    .on('icd10_diagnoses')
    .column('parent_code')
    .execute()

  await db.schema.createTable('icd10_diagnoses_includes')
    .addColumn(
      'id',
      'uuid',
      (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn(
      'code',
      'varchar(8)',
      (col) => col.notNull().references('icd10_diagnoses.code').onDelete('cascade'),
    )
    .addColumn('note', 'text', (col) => col.notNull())
    .addColumn('note_vector', sql`tsvector`, (col) => col.notNull())
    .addColumn('sourced_from_index', 'boolean', (col) => col.notNull())
    .execute()

  await db.schema
    .createIndex('idx_icd10_diagnoses_includes_code')
    .on('icd10_diagnoses_includes')
    .column('code')
    .execute()

  await db.schema.createTable('icd10_diagnoses_excludes')
    .addColumn(
      'id',
      'uuid',
      (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn(
      'code',
      'varchar(8)',
      (col) => col.notNull().references('icd10_diagnoses.code').onDelete('cascade'),
    )
    .addColumn('note', 'text', (col) => col.notNull())
    .addColumn('pure', 'boolean', (col) => col.notNull())
    .execute()

  await db.schema
    .createIndex('idx_icd10_diagnoses_excludes_code')
    .on('icd10_diagnoses_excludes')
    .column('code')
    .execute()

  await db.schema.createTable('icd10_diagnoses_excludes_categories')
    .addColumn(
      'id',
      'uuid',
      (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn(
      'exclude_id',
      'uuid',
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

  await db.schema
    .createIndex('idx_icd10_diagnoses_excludes_categories_exclude_id')
    .on('icd10_diagnoses_excludes_categories')
    .column('exclude_id')
    .execute()

  await db.schema
    .createIndex('idx_icd10_diagnoses_excludes_categories_category')
    .on('icd10_diagnoses_excludes_categories')
    .column('category')
    .execute()

  await db.schema.createTable('icd10_diagnoses_excludes_codes')
    .addColumn(
      'id',
      'uuid',
      (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn(
      'exclude_id',
      'uuid',
      (col) =>
        col.notNull().references('icd10_diagnoses_excludes.id').onDelete(
          'cascade',
        ),
    )
    .addColumn(
      'code',
      'varchar(8)',
      (col) => col.notNull().references('icd10_diagnoses.code').onDelete('cascade'),
    )
    .addColumn('dash', 'boolean', (col) => col.notNull().defaultTo(false))
    .execute()

  await db.schema
    .createIndex('idx_icd10_diagnoses_excludes_codes_exclude_id')
    .on('icd10_diagnoses_excludes_codes')
    .column('exclude_id')
    .execute()

  await db.schema
    .createIndex('idx_icd10_diagnoses_excludes_codes_code')
    .on('icd10_diagnoses_excludes_codes')
    .column('code')
    .execute()

  await db.schema.createTable('icd10_diagnoses_excludes_code_ranges')
    .addColumn(
      'id',
      'uuid',
      (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`),
    )
    .addColumn(
      'exclude_id',
      'uuid',
      (col) =>
        col.notNull().references('icd10_diagnoses_excludes.id').onDelete(
          'cascade',
        ),
    )
    .addColumn(
      'code_range_start',
      'varchar(8)',
      (col) => col.notNull().references('icd10_diagnoses.code').onDelete('cascade'),
    )
    .addColumn(
      'code_range_end',
      'varchar(8)',
      (col) => col.notNull().references('icd10_diagnoses.code').onDelete('cascade'),
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

  await db.schema
    .createIndex('idx_icd10_diagnoses_excludes_code_ranges_exclude_id')
    .on('icd10_diagnoses_excludes_code_ranges')
    .column('exclude_id')
    .execute()

  await db.schema
    .createIndex('idx_icd10_diagnoses_excludes_code_ranges_code_range_start')
    .on('icd10_diagnoses_excludes_code_ranges')
    .column('code_range_start')
    .execute()

  await db.schema
    .createIndex('idx_icd10_diagnoses_excludes_code_ranges_code_range_end')
    .on('icd10_diagnoses_excludes_code_ranges')
    .column('code_range_end')
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

export async function down(db: Kysely<DB>) {
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
