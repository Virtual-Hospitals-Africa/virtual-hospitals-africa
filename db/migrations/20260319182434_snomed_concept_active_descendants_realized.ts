import type { DB } from '../../db.d.ts'
import { Kysely } from 'kysely'

export async function up(db: Kysely<DB>) {
  await db.schema.createTable('snomed_concept_active_descendants_realized')
    .addColumn(
      'ancestor_id',
      'bigint',
      (col) => col.notNull().references('snomed_concept.id').onDelete('cascade'),
    )
    .addColumn(
      'descendant_id',
      'bigint',
      (col) => col.notNull().references('snomed_concept.id').onDelete('cascade'),
    )
    .addPrimaryKeyConstraint('ancestor_descendant', ['ancestor_id', 'descendant_id'])
    .execute()

  await db.schema
    .createIndex('idx_snomed_concept_active_descendants_realized_ancestor_id')
    .on('snomed_concept_active_descendants_realized')
    .column('ancestor_id')
    .execute()

  await db.schema
    .createIndex('idx_snomed_concept_active_descendants_realized_descendant_id')
    .on('snomed_concept_active_descendants_realized')
    .column('descendant_id')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('snomed_concept_active_descendants_realized').execute()
}
