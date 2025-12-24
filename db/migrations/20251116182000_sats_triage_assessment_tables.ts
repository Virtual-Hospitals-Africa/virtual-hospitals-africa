import { Kysely, sql } from 'kysely'
import keys from '../../util/keys.ts'
import { VITAL_ASSESSMENTS_SNOMED_CONCEPT_IDS } from '../../shared/vitals.ts'

export async function up(db: Kysely<unknown>) {
  await db.schema.createType('vital_assessment')
    .asEnum(keys(VITAL_ASSESSMENTS_SNOMED_CONCEPT_IDS))
    .execute()

  // 1. Create sats_triage_assessments table
  await db.schema
    .createTable('sats_triage_assessments')
    .addColumn(
      'assessment_snomed_concept_id',
      'bigint',
      (col) => col.primaryKey(),
    )
    .addColumn('vital', sql`vital_assessment`, (col) => col.notNull())
    .addColumn('category', 'varchar(100)', (col) => col.notNull())
    .addColumn('display_order', 'integer', (col) => col.notNull())
    .addColumn(
      'required_for_triage',
      'boolean',
      (col) => col.notNull().defaultTo(false),
    )
    .addColumn(
      'created_at',
      'timestamptz',
      (col) => col.notNull().defaultTo(sql`now()`),
    )
    .addColumn(
      'updated_at',
      'timestamptz',
      (col) => col.notNull().defaultTo(sql`now()`),
    )
    .execute()

  // 2. Create sats_triage_assessment_options table
  await db.schema
    .createTable('sats_triage_assessment_options')
    .addColumn('id', 'uuid', (col) => col.primaryKey())
    .addColumn(
      'assessment_snomed_concept_id',
      'bigint',
      (col) =>
        col.notNull().references(
          'sats_triage_assessments.assessment_snomed_concept_id',
        )
          .onDelete('cascade'),
    )
    .addColumn('option_snomed_concept_id', 'bigint', (col) => col.notNull())
    .addColumn('display_label', 'varchar(255)', (col) => col.notNull())
    .addColumn('display_order', 'integer', (col) => col.notNull())
    .addColumn('ordinal_value', 'integer', (col) => col.notNull())
    .addColumn(
      'created_at',
      'timestamptz',
      (col) => col.notNull().defaultTo(sql`now()`),
    )
    .addColumn(
      'updated_at',
      'timestamptz',
      (col) => col.notNull().defaultTo(sql`now()`),
    )
    .addUniqueConstraint('unique_assessment_option', [
      'assessment_snomed_concept_id',
      'option_snomed_concept_id',
    ])
    .execute()

  // Create index
  await db.schema
    .createIndex('idx_sats_assessment_options_assessment_id')
    .on('sats_triage_assessment_options')
    .column('assessment_snomed_concept_id')
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('sats_triage_assessment_options').execute()
  await db.schema.dropTable('sats_triage_assessments').execute()
  await db.schema.dropType('vital_assessment').execute()
}
