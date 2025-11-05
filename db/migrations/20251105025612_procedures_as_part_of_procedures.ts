import { Kysely } from 'kysely'
import { DB } from '../../db.d.ts'

export function up(db: Kysely<DB>) {
  return db.schema.alterTable('patient_procedures').addColumn(
    'as_part_of_procedure_id',
    'uuid',
    (col) => col.references('patient_procedures.id').onDelete('cascade'),
  ).execute()
}

export function down(db: Kysely<DB>) {
  return db.schema.alterTable('patient_procedures').dropColumn(
    'as_part_of_procedure_id',
  ).execute()
}
