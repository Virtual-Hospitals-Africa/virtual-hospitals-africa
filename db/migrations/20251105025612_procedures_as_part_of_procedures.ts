import { Kysely } from 'kysely'
import type { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await db.schema.alterTable('patient_procedures').addColumn(
    'as_part_of_procedure_id',
    'uuid',
    (col) => col.references('patient_procedures.id').onDelete('cascade'),
  ).execute()

  await db.schema
    .createIndex('idx_patient_procedures_as_part_of_procedure_id')
    .on('patient_procedures')
    .column('as_part_of_procedure_id')
    .execute()
}

export function down(db: Kysely<DB>) {
  return db.schema.alterTable('patient_procedures').dropColumn(
    'as_part_of_procedure_id',
  ).execute()
}
