import { Kysely } from 'kysely'
import { createPointerTable } from '../createTable.ts'
import type { DB } from '../../db.d.ts'

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
        'uuid',
        (col) => col.references('patient_records.id').notNull().onDelete('cascade'),
      ),
  )

  await db.schema
    .createIndex('idx_patient_record_qualifiers_qualifies_record_id')
    .on('patient_record_qualifiers')
    .column('qualifies_record_id')
    .execute()
}

export function down(db: Kysely<DB>) {
  return db.schema.dropTable('patient_record_qualifiers').execute()
}
