import { Kysely } from 'kysely'
import { createPointerTable } from '../createTable.ts'

export function up(db: Kysely<unknown>) {
  return createPointerTable(
    db,
    'snomed_family_history',
    {
      references: 'snomed_concept',
      primary_key_type: 'bigint',
    },
  )
}

export function down(db: Kysely<unknown>) {
  return db.schema.dropTable('snomed_family_history').execute()
}
