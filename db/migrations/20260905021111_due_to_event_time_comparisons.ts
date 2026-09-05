import { Kysely, sql } from 'kysely'
import type { DB } from '../../db.d.ts'
import { createPointerTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await createPointerTable(db, 'due_to_event_time_comparisons', { references: 'due_to', primary_key_type: 'uuid' }, (qb) =>
    qb
      .addColumn('event_snomed_concept_id', 'bigint', (col) => col.notNull().references('snomed_concept.id').onDelete('cascade'))
      .addColumn('root_snomed_concept_id', 'bigint', (col) => col.references('snomed_concept.id').onDelete('cascade'))
      .addColumn('specific_snomed_concept_id', 'bigint', (col) => col.notNull().references('snomed_concept.id').onDelete('cascade'))
      .addColumn('comparator', sql`comparator`, (col) => col.notNull().check(sql`comparator != '='`))
      // time-ago space: a rule's (time_ago 24 hours), applied in queries as now() - duration
      .addColumn('duration', sql`interval`, (col) => col.notNull()))

  await db.schema.createIndex('due_to_event_time_comparisons_specific_snomed_concept_id_idx')
    .on('due_to_event_time_comparisons')
    .column('specific_snomed_concept_id')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('due_to_event_time_comparisons').execute()
}
