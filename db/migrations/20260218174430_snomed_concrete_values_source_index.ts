import { Kysely } from 'kysely'
import type { DB } from '../../db.d.ts'

// TODO merge with snomed migration and generate a new dump.
// Delaying because best to do that in one batch of work where we have thought through all our indexes
export async function up(db: Kysely<DB>) {
  await db.schema
    .createIndex('idx_snomed_rcv_type_value_source')
    .ifNotExists()
    .on('snomed_relationship_concrete_values')
    .columns(['type_id', 'value', 'source_id'])
    .execute()

  // For subqueries filtering on type_id + source_id and returning destination_id
  await db.schema
    .createIndex('idx_snomed_rel_type_source_dest')
    .ifNotExists()
    .on('snomed_relationship')
    .columns(['type_id', 'source_id', 'destination_id'])
    .execute()
}

export async function down(_db: Kysely<DB>) {
}
