import { Kysely, sql } from "kysely"
import { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await db.schema.alterTable('snomed_description')
    .addColumn('term_vector', sql`tsvector`)
    .execute()

  await db.schema.alterTable('snomed_inferred_canonical_name_and_category')
    .addColumn('name_vector', sql`tsvector`)
    .execute()

  // Populate tsvector columns for existing SNOMED data
  await sql`
    UPDATE snomed_description
    SET term_vector = to_tsvector('english', term)
  `.execute(db)

  await sql`
    UPDATE snomed_inferred_canonical_name_and_category
    SET name_vector = to_tsvector('english', name)
  `.execute(db)

  // Create GIN indexes for fast full-text search
  await sql`
    CREATE INDEX ts_snomed_description_term
    ON snomed_description
    USING GIN (term_vector)
  `.execute(db)

  await sql`
    CREATE INDEX ts_snomed_inferred_canonical_name_and_category_name
    ON snomed_inferred_canonical_name_and_category
    USING GIN (name_vector)
  `.execute(db)

  // When done, now this should work
  await db.schema.alterTable('snomed_description')
    .alterColumn('term_vector', col => col.setNotNull())
    .execute()

  await db.schema.alterTable('snomed_inferred_canonical_name_and_category')
    .alterColumn('name_vector', col => col.setNotNull())
    .execute()
}

export async function down(db: Kysely<DB>){
  await db.schema.alterTable('snomed_description').dropColumn('term_vector').execute()
  await db.schema.alterTable('snomed_inferred_canonical_name_and_category').dropColumn('name_vector').execute()
}
