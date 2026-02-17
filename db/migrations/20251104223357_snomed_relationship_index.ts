import { Kysely, sql } from 'kysely'
import type { DB } from '../../db.d.ts'

export function up(db: Kysely<DB>) {
  return sql`
    CREATE INDEX IF NOT EXISTS idx_snomed_relationship_source_destination 
    ON snomed_relationship(destination_id, source_id) 
  `.execute(db)
}

export function down(db: Kysely<DB>) {
  return sql`
    DROP INDEX IF EXISTS idx_snomed_relationship_source_destination
  `.execute(db)
}
