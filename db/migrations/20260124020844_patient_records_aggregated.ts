import { Kysely, sql } from 'kysely'
import type { DB } from '../../db.d.ts'
import { createPointerTable } from '../createTable.ts'

export async function up(db: Kysely<DB>) {
  await db.schema.createType('existence').asEnum(['Yes', 'No', 'Unknown']).execute()

  // Create the aggregated table with normalized columns
  await createPointerTable(
    db,
    'patient_records_aggregated',
    {
      references: 'patient_records',
      primary_key_type: 'uuid',
    },
    (qb) =>
      qb
        .addColumn('created_at', 'timestamptz', (col) => col.notNull())
        .addColumn('patient_id', 'uuid', (col) => col.notNull().references('patients.id').onDelete('cascade'))
        .addColumn('patient_encounter_id', 'uuid', (col) => col.notNull().references('patient_encounters.id').onDelete('cascade'))
        .addColumn('root_snomed_concept_id', 'bigint', (col) => col.notNull().references('snomed_concept.id').onDelete('cascade'))
        .addColumn('root_snomed_concept_name', 'text', (col) => col.notNull())
        .addColumn('root_snomed_concept_category', sql`snomed_category`, (col) => col.notNull())
        .addColumn('specific_snomed_concept_id', 'bigint', (col) => col.notNull().references('snomed_concept.id').onDelete('cascade'))
        .addColumn('specific_snomed_concept_name', 'text', (col) => col.notNull())
        .addColumn('specific_snomed_concept_category', sql`snomed_category`, (col) => col.notNull())
        .addColumn('existence', sql`existence`, (col) => col.notNull())
        .addColumn('value', 'jsonb'),
  )

  await db.schema
    .createIndex('idx_patient_records_aggregated_patient_encounter_id')
    .on('patient_records_aggregated')
    .column('patient_encounter_id')
    .execute()
}

export async function down(db: Kysely<DB>) {
  await db.schema.dropTable('patient_records_aggregated').execute()
  await db.schema.dropType('existence').execute()
}
