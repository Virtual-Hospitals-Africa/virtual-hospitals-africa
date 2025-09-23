import { Kysely } from 'kysely'
import { createPointerTable } from '../createTable.ts'

export function up(db: Kysely<unknown>) {
  return createPointerTable(
    db,
    'patient_triage_level',
    {
      references: 'patient_evaluations',
      primary_key_type: 'uuid',
      include_created_at: true,
    },
    (qb) =>
      qb
        .addColumn(
          'target_treatment_time',
          'timestamptz',
        ),
  )
}

export function down(db: Kysely<unknown>) {
  return db.schema.dropTable('patient_triage_level').execute()
}
