import { Kysely, sql } from 'kysely'
import type { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  // Create GIN trigram indexes for fast fuzzy search using pg_trgm
  await sql`
    CREATE INDEX trgm_snomed_description_term
    ON snomed_description
    USING GIN (term gin_trgm_ops)
  `.execute(db)

  await sql`
    CREATE INDEX trgm_snomed_inferred_canonical_name_and_category_name
    ON snomed_inferred_canonical_name_and_category
    USING GIN (name gin_trgm_ops)
  `.execute(db)
}

export async function down(db: Kysely<DB>) {
  await sql`DROP INDEX trgm_snomed_description_term`.execute(db)
  await sql`DROP INDEX trgm_snomed_inferred_canonical_name_and_category_name`
    .execute(db)
}
