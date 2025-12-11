import { Kysely, sql } from 'kysely'
import { DB } from '../../db.d.ts'

export function up(db: Kysely<DB>) {
  return sql`
    CREATE INDEX IF NOT EXISTS idx_snomed_relationship_type_destination 
    ON snomed_relationship(destination_id, type_id);

    CREATE INDEX IF NOT EXISTS idx_snomed_relationship_source_type_active
    ON snomed_relationship(source_id, type_id)
    WHERE active = true;

    CREATE INDEX IF NOT EXISTS idx_snomed_relationship_destination
    ON snomed_relationship(destination_id)
    WHERE active = true AND type_id = 116680003;
  `.execute(db)
}

export function down(db: Kysely<DB>) {
  return sql`
    DROP INDEX IF EXISTS idx_snomed_relationship_type_destination;
    DROP INDEX IF EXISTS idx_snomed_relationship_source_type_active;
    DROP INDEX IF EXISTS idx_snomed_relationship_destination;
  `.execute(db)
}
