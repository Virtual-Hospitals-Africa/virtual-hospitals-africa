import { Kysely } from 'kysely'
import { createPointerTable } from '../createTable.ts'

export async function up(db: Kysely<unknown>) {
  await createPointerTable(
    db,
    'warning_signs',
    {
      references: 'snomed_concept',
      primary_key_type: 'bigint',
    },
    (qb) =>
      qb.addColumn('sats_primary_name', 'varchar(255)', (col) => col.notNull())
        .addColumn('sats_secondary_text', 'varchar(255)')
        .addColumn('sats_priority', 'varchar(255)'),
  )
}

export function down(db: Kysely<unknown>) {
}
