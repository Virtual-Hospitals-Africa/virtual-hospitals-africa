import type { DB } from '../../db.d.ts'
import { Kysely } from 'kysely'
import { createPointerTable } from '../createTable.ts'
import { assertOnInsert } from '../helpers.ts'
import { TRIAGE_LEVELS } from '../../shared/priorities.ts'

const check_priority = assertOnInsert({
  table: 'patient_triage_level',
  function_name: 'check_patient_triage_level_priority',
  assertion: `EXISTS (
    SELECT 1 
      FROM sats_priority_levels
     WHERE sats_priority_levels.id IN (
      SELECT value_snomed_concept_id
        FROM patient_records
       WHERE patient_records.id = NEW.id
     )
  )`,
  error_message:
    `format('The patient_triage_level.id %s points to a row in patient_records whose snomed_concept_id is not a valid SATS priority level', NEW.id)`,
  after: true,
})

export async function up(db: Kysely<DB>) {
  await db.schema.createType('sats_priority_level')
    .asEnum(TRIAGE_LEVELS)
    .execute()

  await createPointerTable(db, 'sats_priority_levels', {
    references: 'snomed_concept',
    primary_key_type: 'bigint',
  }, (qb) => qb.addColumn('sats_name', 'varchar(255)', (col) => col.notNull()))

  await createPointerTable(
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

  await check_priority.up(db)
}

export async function down(db: Kysely<DB>) {
  await check_priority.down(db)
  await db.schema.dropTable('patient_triage_level').execute()
  await db.schema.dropTable('sats_priority_levels').execute()
  await db.schema.dropType('sats_priority_level').execute()
}
