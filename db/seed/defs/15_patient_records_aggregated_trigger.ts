import { assert } from 'std/assert/assert.ts'
import { RawBuilder, sql } from 'kysely'
import { NO_QUALIFIER, UNKNOWN_QUALIFIER } from '../../../shared/snomed_concepts.ts'
import {
  RecordValueEvent,
  RecordValueLink,
  RecordValueMeasurement,
  RecordValueScore,
  RecordValueSnomedConcept,
  RecordValueTask,
  TrxOrDb,
} from '../../../types.ts'
import db from '../../db.ts'
import { asCompiledSql, asText, jsonBuildObject, literalString } from '../../helpers.ts'
import { define } from '../define.ts'

export default define([
  'patient_records_aggregated',
], async (trx: TrxOrDb) => {
  // Build the aggregation query using Kysely (similar to nonGroupedBaseQuery)
  const aggregation_query = trx
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
    // .leftJoin(
    //   'patient_record_s_expressions as maybe_s_expressions',
    //   'patient_records.id',
    //   'maybe_s_expressions.id',
    // )
    .leftJoin(
      'patient_record_links as maybe_links',
      'patient_records.id',
      'maybe_links.id',
    )
    .leftJoin(
      'patient_record_tasks as maybe_tasks',
      'patient_records.id',
      'maybe_tasks.id',
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
        // .when('maybe_s_expressions.id', 'is not', null)
        // .then(
        //   jsonBuildObject({
        //     type: literalString('s_expression' as const),
        //     s_expression: asText(eb, 'maybe_s_expressions.s_expression').$notNull(),
        //   }) satisfies RawBuilder<RecordValueSExpression>,
        // )
        .when('maybe_links.id', 'is not', null)
        .then(
          jsonBuildObject({
            type: literalString('link' as const),
            title: eb.ref('maybe_links.title').$notNull(),
            href: eb.ref('maybe_links.href').$notNull(),
            thumbnail_href: eb.ref('maybe_links.thumbnail_href').$notNull(),
          }) satisfies RawBuilder<RecordValueLink>,
        )
        .when('maybe_tasks.id', 'is not', null)
        .then(
          jsonBuildObject({
            type: literalString('task' as const),
            task_id: eb.ref('maybe_tasks.task_id').$notNull(),
          }) satisfies RawBuilder<RecordValueTask>,
        )
        .end().as('value'),
    ])

  // Compile the Kysely query to SQL
  const compiled_sql = asCompiledSql(aggregation_query)

  // The trigger fires once per statement rather than once per row, so the query
  // reads the newly inserted rows out of the NEW TABLE transition table instead
  // of re-reading patient_records. Aliasing it as patient_records keeps every
  // patient_records.<column> reference in the compiled SQL valid.
  //
  // It has to read the transition table directly: filtering patient_records by
  // `id in (select id from new_rows)` plans terribly, as the transition tuplestore
  // carries no statistics for the planner to work with.
  const from_patient_records = /\bfrom\s+"patient_records"/g
  const occurrences = compiled_sql.match(from_patient_records)?.length ?? 0
  assert(
    occurrences === 1,
    `Expected exactly one 'from "patient_records"' in the compiled aggregation query, got ${occurrences}`,
  )
  const compiled_sql_over_new_rows = compiled_sql.replace(
    from_patient_records,
    'from "new_rows" as "patient_records"',
  )

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
      ${sql.raw(compiled_sql_over_new_rows)};
      RETURN NULL;
    END;
    $$ LANGUAGE plpgsql;

    -- Dropped rather than replaced because CREATE OR REPLACE TRIGGER cannot
    -- switch an existing FOR EACH ROW trigger to FOR EACH STATEMENT.
    DROP TRIGGER IF EXISTS ${sql.raw(trigger_name)} ON patient_records;

    CREATE TRIGGER ${sql.raw(trigger_name)}
    AFTER INSERT ON patient_records
    REFERENCING NEW TABLE AS new_rows
    FOR EACH STATEMENT
    EXECUTE FUNCTION ${sql.raw(function_name)}();
  `.execute(db)
}, { always_run: true })
