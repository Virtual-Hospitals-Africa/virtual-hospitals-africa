import { Kysely } from 'kysely'
import { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await db.schema.alterTable('patient_procedures').addColumn(
    'as_part_of_procedure_id',
    'uuid',
  ).execute()

  await db.schema.alterTable('patient_procedures').addForeignKeyConstraint(
    `fk_patient_procedures_as_part_of_procedure_id_patient_id`,
    // deno-lint-ignore no-explicit-any
    ['as_part_of_procedure_id', 'patient_id'] as any,
    'patient_procedures',
    ['id', 'patient_id'],
    (cb) => cb.onDelete('cascade'),
  ).execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.alterTable('patient_procedures').dropConstraint(
    'fk_patient_procedures_as_part_of_procedure_id_patient_id',
  ).execute()
  await db.schema.alterTable('patient_procedures').dropColumn(
    'as_part_of_procedure_id',
  ).execute()
}
