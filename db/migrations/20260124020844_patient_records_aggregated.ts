import { Kysely, RawBuilder, sql } from 'kysely'
import { DB } from '../../db.d.ts'
import { createPointerTable } from '../createTable.ts'
import { asCompiledSql, asText, jsonBuildObject, literalString } from '../helpers.ts'
import { NO_QUALIFIER, UNKNOWN_QUALIFIER } from '../../shared/snomed_concepts.ts'
import {
  RecordValueEvent,
  RecordValueLink,
  RecordValueMeasurement,
  RecordValueScore,
  RecordValueSExpression,
  RecordValueSnomedConcept,
} from '../../types.ts'

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
    .createIndex('idx_patient_records_aggregated_patient_id')
    .on('patient_records_aggregated')
    .column('patient_id')
    .execute()

  await db.schema
    .createIndex('idx_patient_records_aggregated_patient_encounter_id')
    .on('patient_records_aggregated')
    .column('patient_encounter_id')
    .execute()

  // Build the aggregation query using Kysely (similar to nonGroupedBaseQuery)
  const aggregation_query = db
    .selectFrom('patient_records')
    .innerJoin(
      'snomed_inferred_canonical_name_and_category as root_snomed_concept',
      'patient_records.root_snomed_concept_id',
      'root_snomed_concept.id',
    )
    .innerJoin(
      'snomed_inferred_canonical_name_and_category as specific_snomed_concept',
      'patient_records.specific_snomed_concept_id',
      'specific_snomed_concept.id',
    )
    .leftJoin(
      'snomed_inferred_canonical_name_and_category as value_snomed_concept',
      'patient_records.value_snomed_concept_id',
      'value_snomed_concept.id',
    )
    .leftJoin(
      'patient_events as maybe_events',
      'patient_records.id',
      'maybe_events.id',
    )
    .leftJoin(
      'patient_measurements as maybe_measurements',
      'patient_records.id',
      'maybe_measurements.id',
    )
    .leftJoin(
      'patient_evaluation_scores as maybe_scores',
      'patient_records.id',
      'maybe_scores.id',
    )
    .leftJoin(
      'patient_record_s_expressions as maybe_s_expressions',
      'patient_records.id',
      'maybe_s_expressions.id',
    )
    .leftJoin(
      'patient_record_links as maybe_links',
      'patient_records.id',
      'maybe_links.id',
    )
    .select((eb) => [
      'patient_records.id',
      'patient_records.created_at',
      'patient_records.patient_id',
      'patient_records.patient_encounter_id',
      'root_snomed_concept.id as root_snomed_concept_id',
      'root_snomed_concept.name as root_snomed_concept_name',
      'root_snomed_concept.category as root_snomed_concept_category',
      'specific_snomed_concept.id as specific_snomed_concept_id',
      'specific_snomed_concept.name as specific_snomed_concept_name',
      'specific_snomed_concept.category as specific_snomed_concept_category',
      eb.case()
        .when('patient_records.value_snomed_concept_id', '=', NO_QUALIFIER.id)
        .then(sql`'No'::existence`)
        .when(
          'patient_records.value_snomed_concept_id',
          '=',
          UNKNOWN_QUALIFIER.id,
        )
        .then(sql`'Unknown'::existence`)
        .else(sql`'Yes'::existence`)
        .end()
        .as('existence'), // yields Yes/No/Unknown
      eb.case()
        .when('patient_records.value_snomed_concept_id', 'is not', null)
        .then(
          jsonBuildObject({
            type: literalString('snomed_concept' as const),
            snomed_concept_id: asText(eb, 'value_snomed_concept.id'),
            name: eb.ref('value_snomed_concept.name').$notNull(),
            category: eb.ref('value_snomed_concept.category').$notNull(),
          }) satisfies RawBuilder<RecordValueSnomedConcept>,
        )
        .when('maybe_events.id', 'is not', null)
        .then(
          jsonBuildObject({
            type: literalString('event' as const),
            datetime: eb.ref('maybe_events.datetime').$notNull(),
          }) satisfies RawBuilder<RecordValueEvent>,
        )
        .when('maybe_measurements.id', 'is not', null)
        .then(
          jsonBuildObject({
            type: literalString('measurement' as const),
            value: asText(eb, 'maybe_measurements.value').$notNull(),
            units: eb.ref('maybe_measurements.units').$notNull(),
          }) satisfies RawBuilder<RecordValueMeasurement>,
        )
        .when('maybe_scores.id', 'is not', null)
        .then(
          jsonBuildObject({
            type: literalString('score' as const),
            score: asText(eb, 'maybe_scores.score').$notNull(),
          }) satisfies RawBuilder<RecordValueScore>,
        )
        .when('maybe_s_expressions.id', 'is not', null)
        .then(
          jsonBuildObject({
            type: literalString('s_expression' as const),
            s_expression: asText(eb, 'maybe_s_expressions.s_expression').$notNull(),
          }) satisfies RawBuilder<RecordValueSExpression>,
        )
        .when('maybe_links.id', 'is not', null)
        .then(
          jsonBuildObject({
            type: literalString('link' as const),
            title: eb.ref('maybe_links.title').$notNull(),
            href: eb.ref('maybe_links.href').$notNull(),
            thumbnail_href: eb.ref('maybe_links.thumbnail_href').$notNull(),
          }) satisfies RawBuilder<RecordValueLink>,
        )
        .end().as('value'),
    ])

  // Compile the Kysely query to SQL
  const compiled_sql = asCompiledSql(aggregation_query)

  // Create trigger function that uses the compiled SQL
  const function_name = 'populate_patient_records_aggregated'
  const trigger_name = `${function_name}_trigger`

  await sql`
    CREATE OR REPLACE FUNCTION ${sql.raw(function_name)}()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO patient_records_aggregated (
        id,
        created_at,
        patient_id,
        patient_encounter_id,
        root_snomed_concept_id,
        root_snomed_concept_name,
        root_snomed_concept_category,
        specific_snomed_concept_id,
        specific_snomed_concept_name,
        specific_snomed_concept_category,
        existence,
        value
      )
      ${sql.raw(compiled_sql)}
      WHERE patient_records.id = NEW.id;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER ${sql.raw(trigger_name)}
    AFTER INSERT ON patient_records
    FOR EACH ROW
    EXECUTE FUNCTION ${sql.raw(function_name)}();
  `.execute(db)
}

export async function down(db: Kysely<DB>) {
  await sql`DROP TRIGGER IF EXISTS populate_patient_records_aggregated_trigger ON patient_records`.execute(db)
  await sql`DROP FUNCTION IF EXISTS populate_patient_records_aggregated()`.execute(db)
  await db.schema.dropTable('patient_records_aggregated').execute()
  await db.schema.dropType('existence').execute()
}
