import { Kysely } from 'kysely'
import { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await db.schema
    .createIndex('snomed_inferred_canonical_name_and_category_category_idx')
    .on('snomed_inferred_canonical_name_and_category')
    .column('category')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema
    .dropIndex('snomed_inferred_canonical_name_and_category_category_idx')
    .execute()
}
