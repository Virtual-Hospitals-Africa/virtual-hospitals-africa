import { Kysely, sql } from 'kysely'
import type { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await db.schema
    .createTable('snomed_concept_finding_like')
    .addColumn('id', 'bigint', (col) => col.notNull().references('snomed_concept.id').onDelete('cascade'))
    .addColumn('term', 'text', (col) => col.notNull())
    .execute()

  await sql`
    CREATE INDEX trgm_snomed_concept_finding_like_term
    ON snomed_concept_finding_like
    USING GIN (term gin_trgm_ops)
  `.execute(db)

  await db.schema
    .createIndex('snomed_concept_finding_like_concept_id_idx')
    .on('snomed_concept_finding_like')
    .column('id')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await sql`DROP INDEX trgm_snomed_concept_finding_like_term`.execute(db)
  await db.schema.dropTable('snomed_concept_finding_like').execute()
}
