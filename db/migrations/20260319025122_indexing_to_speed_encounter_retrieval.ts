import { Kysely } from 'kysely'
import type { DB } from '../../db.d.ts'

export async function up(db: Kysely<DB>) {
  await db.schema
    .createIndex('idx_patient_records_aggregated_patient_id_specific_snomed_concept_id')
    .on('patient_records_aggregated')
    .columns(['patient_id', 'specific_snomed_concept_id'])
    .execute()

  await db.schema
    .createIndex('idx_patient_workflow_steps_completed_patient_workflow_id')
    .on('patient_workflow_steps_completed')
    .column('patient_workflow_id')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropIndex('idx_patient_records_aggregated_patient_id_specific_snomed_concept_id').execute()
  await db.schema.dropIndex('idx_patient_workflow_steps_completed_patient_workflow_id').execute()
}
