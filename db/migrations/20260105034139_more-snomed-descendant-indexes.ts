import { Kysely, sql } from 'kysely'
import type { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  // Covering index for the is_descendant recursive CTE join:
  // The function joins on source_id, filters by type_id = 116680003 and active = true,
  // and selects destination_id
  await sql`
    CREATE INDEX IF NOT EXISTS idx_snomed_relationship_isa_hierarchy
    ON snomed_relationship (source_id, destination_id)
    WHERE active = true AND type_id = 116680003
  `.execute(db)

  // Also index snomed_concept.active for the join in the CTE
  await sql`
    CREATE INDEX IF NOT EXISTS idx_snomed_concept_active
    ON snomed_concept (id)
    WHERE active = true
  `.execute(db)
}

export async function down(db: Kysely<DB>) {
  await sql`DROP INDEX IF EXISTS idx_snomed_relationship_isa_hierarchy`.execute(
    db,
  )
  await sql`DROP INDEX IF EXISTS idx_snomed_concept_active`.execute(db)
}
