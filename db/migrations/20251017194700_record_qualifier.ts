import { Kysely, sql } from 'kysely'
import { createPointerTable } from '../createTable.ts'
import { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await createPointerTable(
    db,
    'patient_record_qualifiers',
    {
      references: 'patient_records',
      primary_key_type: 'uuid',
    },
    (qb) =>
      qb.addColumn(
        'qualifies_record_id',
        'bigint',
        (col) => col.references('foo.id'),
      ),
  )
}

export function down(db: Kysely<DB>) {
  return db.schema.dropTable('warning_signs').execute()
}
