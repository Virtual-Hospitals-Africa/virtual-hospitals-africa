import { Kysely, sql } from 'kysely'
import { createStandardTable } from '../createTable.ts'

export async function up(db: Kysely<unknown>) {
  await createStandardTable(
    db,
    'age_measurement_requirements',
    (qb) =>
      qb
        .addColumn(
          'required_measurement_snomed_concept_id',
          'bigint',
          (col) => col.notNull().references('snomed_concept.id'),
        )
        .addColumn('age_min_days', 'integer')
        .addColumn('age_max_days', 'integer')
        .addColumn('medical_standard', 'varchar(100)', (col) => col.notNull())
        .addColumn('clinical_rationale', 'text', (col) => col.notNull())
        .addColumn('is_required', 'boolean', (col) => col.notNull().defaultTo(true))
        .addColumn('effective_date', 'date', (col) => col.notNull().defaultTo(sql`CURRENT_DATE`))
        .addColumn('expiration_date', 'date')
        .addColumn('active', 'boolean', (col) => col.notNull().defaultTo(true))
        .addCheckConstraint(
          'age_req_age_min_valid',
          sql`age_min_days IS NULL OR age_min_days >= 0`,
        )
        .addCheckConstraint(
          'age_req_age_max_valid',
          sql`age_max_days IS NULL OR age_max_days >= 0`,
        )
        .addCheckConstraint(
          'age_req_age_range_valid',
          sql`age_min_days IS NULL OR age_max_days IS NULL OR age_min_days <= age_max_days`,
        ),
  )

  await createStandardTable(
    db,
    'condition_measurement_requirements',
    (qb) =>
      qb
        .addColumn(
          'condition_snomed_concept_id',
          'bigint',
          (col) => col.notNull().references('snomed_concept.id'),
        )
        .addColumn(
          'required_measurement_snomed_concept_id',
          'bigint',
          (col) => col.notNull().references('snomed_concept.id'),
        )
        .addColumn('medical_standard', 'varchar(100)', (col) => col.notNull())
        .addColumn('clinical_rationale', 'text', (col) => col.notNull())
        .addColumn('is_required', 'boolean', (col) => col.notNull().defaultTo(true))
        .addColumn('frequency_recommendation', 'varchar(50)')
        .addColumn('effective_date', 'date', (col) => col.notNull().defaultTo(sql`CURRENT_DATE`))
        .addColumn('expiration_date', 'date')
        .addColumn('active', 'boolean', (col) => col.notNull().defaultTo(true)),
  )

  await createStandardTable(
    db,
    'measurement_reference_ranges',
    (qb) =>
      qb
        .addColumn(
          'measurement_snomed_concept_id',
          'bigint',
          (col) => col.notNull().references('snomed_concept.id'),
        )
        .addColumn('age_min_days', 'integer')
        .addColumn('age_max_days', 'integer')
        .addColumn('gender', 'varchar(10)')
        .addColumn('condition_codes', sql`BIGINT[]`)
        .addColumn('normal_min', 'decimal', (col) => col.notNull())
        .addColumn('normal_max', 'decimal', (col) => col.notNull())
        .addColumn('critical_min', 'decimal')
        .addColumn('critical_max', 'decimal')
        .addColumn('units', 'varchar(20)', (col) => col.notNull())
        .addColumn('reference_source', 'varchar(100)', (col) => col.notNull())
        .addColumn('evidence_level', 'varchar(20)')
        .addColumn('clinical_context', 'varchar(255)')
        .addColumn('effective_date', 'date', (col) => col.notNull().defaultTo(sql`CURRENT_DATE`))
        .addColumn('expiration_date', 'date')
        .addColumn('active', 'boolean', (col) => col.notNull().defaultTo(true))
        .addCheckConstraint(
          'ref_range_normal_valid',
          sql`normal_min < normal_max`,
        )
        .addCheckConstraint(
          'ref_range_critical_min_valid',
          sql`critical_min IS NULL OR critical_min <= normal_min`,
        )
        .addCheckConstraint(
          'ref_range_critical_max_valid',
          sql`critical_max IS NULL OR critical_max >= normal_max`,
        )
        .addCheckConstraint(
          'ref_range_age_min_valid',
          sql`age_min_days IS NULL OR age_min_days >= 0`,
        )
        .addCheckConstraint(
          'ref_range_age_max_valid',
          sql`age_max_days IS NULL OR age_max_days >= 0`,
        )
        .addCheckConstraint(
          'ref_range_age_range_valid',
          sql`age_min_days IS NULL OR age_max_days IS NULL OR age_min_days <= age_max_days`,
        )
        .addCheckConstraint(
          'ref_range_evidence_level_valid',
          sql`evidence_level IN ('high', 'moderate', 'low') OR evidence_level IS NULL`,
        )
        .addCheckConstraint(
          'ref_range_gender_valid',
          sql`gender IN ('male', 'female') OR gender IS NULL`,
        ),
  )

  await db.schema
    .createIndex('idx_condition_measurements_unique')
    .on('condition_measurement_requirements')
    .columns([
      'condition_snomed_concept_id',
      'required_measurement_snomed_concept_id',
      'medical_standard',
    ])
    .unique()
    .execute()

  await db.schema
    .createIndex('idx_condition_measurements_lookup')
    .on('condition_measurement_requirements')
    .columns(['condition_snomed_concept_id', 'active', 'effective_date'])
    .where('active', '=', true)
    .execute()

  await db.schema
    .createIndex('idx_age_measurements_lookup')
    .on('age_measurement_requirements')
    .columns(['active', 'age_min_days', 'age_max_days', 'effective_date'])
    .where('active', '=', true)
    .execute()

  await db.schema
    .createIndex('idx_measurement_ref_ranges_lookup')
    .on('measurement_reference_ranges')
    .columns(['measurement_snomed_concept_id', 'active', 'effective_date'])
    .where('active', '=', true)
    .execute()

  await db.schema
    .createIndex('idx_measurement_ref_ranges_conditions')
    .on('measurement_reference_ranges')
    .using('gin')
    .column('condition_codes')
    // TODO @Ettore what's going on here?
    // deno-lint-ignore no-explicit-any
    .where('active' as any, '=', true)
    .execute()
}

export async function down(db: Kysely<unknown>) {
  await db.schema.dropTable('measurement_reference_ranges').execute()
  await db.schema.dropTable('condition_measurement_requirements').execute()
  await db.schema.dropTable('age_measurement_requirements').execute()
}
