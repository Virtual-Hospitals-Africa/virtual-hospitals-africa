import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createStandardTable.ts'

export async function up(db: Kysely<unknown>) {
  await createStandardTable(db, 'patient_observations', (qb) =>
    qb.addColumn(
      'patient_id',
      'uuid',
      (col) => col.notNull().references('patients.id').onDelete('cascade'),
    )
      .addColumn(
        'encounter_id',
        'uuid',
        (col) =>
          col.notNull().references('patient_encounters.id').onDelete('cascade'),
      )
      .addColumn(
        'encounter_provider_id',
        'uuid',
        (col) =>
          col.notNull().references('patient_encounter_providers.id').onDelete(
            'cascade',
          ),
      )
      .addColumn(
        'snomed_concept_id',
        'bigint',
        (col) => col.notNull().references('snomed_concept.id'),
      )
      .addColumn('referent_observation_id', 'uuid', (col) =>
        col.references('patient_observations.id').onDelete('cascade'))
      .addColumn('observation_type', 'varchar(255)', (col) =>
        col.notNull().check(sql`(observation_type = 'measurement')`))
      .addColumn('value', 'json'))
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('patient_observations').execute()
}
