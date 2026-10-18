import { AgeDetermination, Existence, ExtantProcedureOrCreationIntent, IdSelection, InsertRows, Maybe, TrxOrDbOrQueryCreator } from '../../types.ts'
import { asText, blankSelection, caseWhenMatching, jsonBuildObject, literalBoolean, literalJsonArray, literalString } from '../helpers.ts'
import generateUUID from '../../util/uuid.ts'
import { baseInsertMany, patient_records, PatientRecordsSearch } from './patient_records.ts'
import { sql } from 'kysely'
import { base, QueryResult } from './_base.ts'

import { maybeSnomedConceptBase, snomedConceptBase } from './s_expression.ts'
import { Priority, PRIORITY_SNOMED_CODES, TARGET_TIME_TO_TREATMENT_MINUTES } from '../../shared/priorities.ts'
import { tews_component } from '../../util/validators.ts'
import assertHasProperty from '../../util/assertHasProperty.ts'
import { insertable_finding_base, InsertableFindingBase, Lang, MeasurementComparison } from '../../shared/s_expression_schemas.ts'
import { asNode, parseWithSchema } from '../../shared/s_expression.ts'
import { asExistence } from '../../shared/existence.ts'
import { formatRecord } from '../../shared/patient_records.ts'
import {
  DUE_TO,
  EVALUATION_ACTION,
  EVENT,
  MEASUREMENT_FINDING,
  NO_QUALIFIER,
  PRIORITY,
  PROCEDURE,
  RELATIONSHIP,
  SEVERITY_SCORE,
  UNKNOWN_QUALIFIER,
  YES_QUALIFIER,
} from '../../shared/snomed_concepts.ts'
import isString from '../../util/isString.ts'
import compact from '../../util/compact.ts'
import { assert } from 'std/assert/assert.ts'

import { SNOMED_CONCEPT_IDS_TO_WORKFLOW_NAMES } from '../../shared/workflow.ts'
import { FINDING_MATCH_TYPES, MEASUREMENT_MATCH_TYPES, withTaggingOfInsertedRecords } from './due_to.ts'
import { patient_procedures } from './patient_procedures.ts'
import { pMap } from '../../util/inParallel.ts'

export type PatientFindingsSearch = PatientRecordsSearch & {
  procedure_id?: string | IdSelection
  // s_expression?: string | Lang['finding']
  not_measurements?: boolean
  include_negative?: boolean
}

export type IntermediateFinding = QueryResult<typeof patient_findings.baseQuery>
type InsertCommon = {
  patient_id: string
  patient_encounter_id: string
  patient_encounter_employee_id: string
}

export type FindingNodeToInsert = InsertableFindingBase & {
  // Callers may supply the record id, as when the frontend generates it ahead of time
  id?: string
  priority?: Maybe<{
    level: Priority
    by_system: boolean
  }>
  score?: {
    value: number | null
    evaluation_snomed_concept_id: string
  }
}

export type MeasurementToInsert = MeasurementComparison & {
  priority?: Maybe<{
    level: Priority
    by_system: boolean
  }>
  score?: number | null
}

type FindingsInsert = InsertCommon & {
  employment_id: string
  patient_age_determination: AgeDetermination
  procedure: ExtantProcedureOrCreationIntent
  findings: Array<FindingNodeToInsert | string>
  measurements?: Array<MeasurementToInsert>
}

/*
  A negative finding is one whose value is No or Unknown. Neither can satisfy a due_to, so
  nothing needs tagging. It carries no priority or score: those are about positive findings
  and measurements, so insertOnePositive and insertMeasurements are where they belong.
*/
export type NegativeFindingToInsert = FindingNodeToInsert & {
  existence: 'No' | 'Unknown'
  priority?: null
  score?: undefined
}

type InsertProcedureCommon = InsertCommon & {
  employment_id: string
  procedure: ExtantProcedureOrCreationIntent
}

type InsertNegativeInput = InsertProcedureCommon & {
  findings: Array<NegativeFindingToInsert | string>
}

type InsertOnePositiveInput = InsertProcedureCommon & {
  patient_age_determination: AgeDetermination
  finding: FindingNodeToInsert | string
}

type InsertMeasurementsInput = InsertProcedureCommon & {
  patient_age_determination: AgeDetermination
  measurements: MeasurementToInsert[]
}

// The result of the precise methods, which spreads straight into the data of a FindingsAdded event
export type InsertResult = {
  procedure_id: string
  records: InsertedRecord[]
}

export type InsertedRecord = {
  id: string
  existence: Existence
}

/*
  Callers dispatch events about what was just inserted, so they need each
  record's existence alongside its id rather than having to derive it themselves.
*/
function insertedRecord(
  { record_id, value_snomed_concept }: {
    record_id: string
    value_snomed_concept: Maybe<Lang['snomed_concept']>
  },
): InsertedRecord {
  return {
    id: record_id,
    existence: asExistence(value_snomed_concept),
  }
}

// A finding as the node it is parsed to, ready for the insert
function prepareFinding(
  { patient_id, patient_encounter_id }: Pick<InsertCommon, 'patient_id' | 'patient_encounter_id'>,
  finding: FindingNodeToInsert | string,
) {
  const finding_node = asNode(finding, 'finding')
  assertHasProperty(finding_node, 'root_snomed_concept')
  assertHasProperty(finding_node, 'specific_snomed_concept')
  const priority = typeof finding === 'object' && 'priority' in finding ? finding.priority : undefined
  const score = typeof finding === 'object' && 'score' in finding ? finding.score : undefined
  const record_id = typeof finding === 'object' && finding.id ? finding.id : generateUUID()
  return {
    patient_id,
    patient_encounter_id,
    record_id,
    ...finding_node,
    priority,
    score,
  }
}

function prepareMeasurement(
  { patient_id, patient_encounter_id }: Pick<InsertCommon, 'patient_id' | 'patient_encounter_id'>,
  measurement: MeasurementToInsert,
) {
  const priority = 'priority' in measurement ? measurement.priority : undefined
  const score = 'score' in measurement ? measurement.score : undefined
  const { measurement: { snomed_concept, units }, value } = measurement as MeasurementComparison
  return {
    patient_id,
    patient_encounter_id,
    record_id: generateUUID(),
    root_snomed_concept: { atom: 'snomed_concept' as const, ...MEASUREMENT_FINDING } as Lang['snomed_concept'],
    specific_snomed_concept: snomed_concept,
    value_snomed_concept: null,
    measurement_node: { snomed_concept, units },
    measurement_value: value,
    attributes: [],
    priority,
    score,
  }
}

type PreparedFinding = ReturnType<typeof prepareFinding>
type PreparedMeasurement = ReturnType<typeof prepareMeasurement>

function isNegativeValue(value_snomed_concept: Maybe<Lang['snomed_concept']>) {
  return asExistence(value_snomed_concept) !== 'Yes'
}

/*
  Classified by value, never by the existence field alone or by a null value: Yes can be stored as
  a value (brief_history stores the Yes qualifier), and existence is derived from the value.
  A negative-looking finding that carries a priority or score is not negative here.
*/
export function isNegativeFinding(finding: FindingNodeToInsert): finding is NegativeFindingToInsert {
  const existence = asExistence(finding.value_snomed_concept)
  return existence !== 'Yes' && finding.existence === existence && !finding.priority && finding.score == null
}

// The insert of the findings and everything hanging off them, before due_to tagging
function insertSansDueTo(
  trx: TrxOrDbOrQueryCreator,
  {
    patient_id,
    patient_encounter_id,
    employment_id,
    patient_encounter_employee_id,
    procedure,
    findings_to_insert,
    measurements_to_insert,
  }: InsertProcedureCommon & {
    findings_to_insert: PreparedFinding[]
    measurements_to_insert: PreparedMeasurement[]
  },
) {
  /*
    With if_not_already_exists, procedure.procedure_id is a query for a procedure that may or may
    not exist yet. The procedure_record CTE below resolves to either that existing record or the one
    inserted here, so dependent rows reference it via a subquery rather than a fixed id.
  */
  const procedure_id = procedure.if_not_already_exists ? sql<string>`(select id from procedure_record)` : procedure.procedure_id || generateUUID()
  const new_procedure_id = generateUUID()

  const records_to_insert = [...findings_to_insert, ...measurements_to_insert]

  const attribute_records: InsertRows<'patient_records'> = []
  const attribute_qualifiers: InsertRows<'patient_record_qualifiers'> = []
  const event_values: InsertRows<'patient_events'> = []
  const triage_level_records: InsertRows<'patient_records'> = []
  const triage_level_evaluations: InsertRows<'patient_evaluations'> = []
  const triage_level_values: InsertRows<'patient_triage_level'> = []
  const triage_relation_records: InsertRows<'patient_records'> = []
  const triage_relations: InsertRows<'patient_record_relations'> = []
  const score_records: InsertRows<'patient_records'> = []
  const score_evaluations: InsertRows<'patient_evaluations'> = []
  const score_values: InsertRows<'patient_evaluation_scores'> = []

  for (const record of records_to_insert) {
    const { record_id, attributes, priority, score } = record
    // Collect attributes
    for (const attribute of attributes) {
      const attribute_id = generateUUID()
      const { value } = attribute

      if (value?.atom === 'event') {
        attribute_records.push({
          id: attribute_id,
          patient_id,
          patient_encounter_id,
          root_snomed_concept_id: EVENT.id,
          specific_snomed_concept_id: snomedConceptBase(
            trx,
            attribute.specific_snomed_concept,
          ),
          value_snomed_concept_id: null,
        })

        attribute_qualifiers.push({
          id: attribute_id,
          qualifies_record_id: record_id,
        })

        event_values.push({
          id: attribute_id,
          datetime: value.datetime,
        })
      } else {
        attribute_records.push({
          id: attribute_id,
          patient_id,
          patient_encounter_id,
          root_snomed_concept_id: snomedConceptBase(
            trx,
            attribute.root_snomed_concept,
          ),
          specific_snomed_concept_id: snomedConceptBase(
            trx,
            attribute.specific_snomed_concept,
          ),
          value_snomed_concept_id: maybeSnomedConceptBase(trx, value),
        })

        attribute_qualifiers.push({
          id: attribute_id,
          qualifies_record_id: record_id,
        })
      }
    }

    // Collect priority/triage level
    if (priority) {
      const triage_level_evaluation_id = generateUUID()
      const relation_id = generateUUID()
      const value_snomed_concept_id = PRIORITY_SNOMED_CODES[priority.level]
      const target_treatment_minutes = TARGET_TIME_TO_TREATMENT_MINUTES[priority.level]

      triage_level_records.push({
        id: triage_level_evaluation_id,
        patient_id,
        patient_encounter_id,
        root_snomed_concept_id: EVALUATION_ACTION.id,
        specific_snomed_concept_id: PRIORITY.id,
        value_snomed_concept_id,
      })

      triage_level_evaluations.push({
        id: triage_level_evaluation_id,
        employment_id: priority.by_system ? null : employment_id,
        by_system: priority.by_system,
        procedure_id,
      })

      triage_level_values.push({
        id: triage_level_evaluation_id,
        target_treatment_time: sql<Date>`now() + interval '${sql.raw(target_treatment_minutes.toString())} minutes'`,
      })

      triage_relation_records.push({
        id: relation_id,
        patient_id,
        patient_encounter_id,
        root_snomed_concept_id: RELATIONSHIP.id,
        specific_snomed_concept_id: DUE_TO.id,
      })

      triage_relations.push({
        id: relation_id,
        source_id: triage_level_evaluation_id,
        destination_id: record_id,
      })
    }

    // Collect score
    if (score != null) {
      const score_value = typeof score === 'object' ? score.value : score
      const evaluation_snomed_concept_id = typeof score === 'object' ? score.evaluation_snomed_concept_id : SEVERITY_SCORE.id

      if (score_value != null) {
        const score_evaluation_id = generateUUID()

        score_records.push({
          id: score_evaluation_id,
          patient_id,
          patient_encounter_id,
          root_snomed_concept_id: EVALUATION_ACTION.id,
          specific_snomed_concept_id: evaluation_snomed_concept_id,
          value_snomed_concept_id: null,
        })

        score_evaluations.push({
          id: score_evaluation_id,
          evaluates_record_id: record_id,
          employment_id: null,
          by_system: true,
          procedure_id,
        })

        score_values.push({
          id: score_evaluation_id,
          score: score_value,
        })
      }
    }
  }

  const query = baseInsertMany(trx, records_to_insert)
    .with(
      'maybe_inserting_procedure_record',
      (qb) =>
        procedure.if_not_already_exists
          ? qb.insertInto('patient_records')
            .columns(['id', 'patient_id', 'patient_encounter_id', 'root_snomed_concept_id', 'specific_snomed_concept_id'])
            .expression(
              qb.selectNoFrom([
                literalString(new_procedure_id).as('id'),
                literalString(patient_id).as('patient_id'),
                literalString(patient_encounter_id).as('patient_encounter_id'),
                literalString(PROCEDURE.id).as('root_snomed_concept_id'),
                literalString(procedure.create_with_specific_snomed_concept_id).as('specific_snomed_concept_id'),
              ]).where(({ not, exists }) => not(exists(procedure.procedure_id))),
            ).returning('id')
          : procedure.create_with_specific_snomed_concept_id
          ? qb.insertInto('patient_records')
            .values({
              id: procedure_id,
              patient_id,
              patient_encounter_id,
              root_snomed_concept_id: PROCEDURE.id,
              specific_snomed_concept_id: procedure.create_with_specific_snomed_concept_id,
            }).returning('id')
          : qb.selectNoFrom([
            literalString(procedure.procedure_id!).as('id'),
          ]),
    ).with(
      'procedure_record',
      (qb) => {
        const maybe_inserted = qb.selectFrom('maybe_inserting_procedure_record').select('id')
        // All CTEs share one snapshot, so at most one side of this union yields a row
        return procedure.if_not_already_exists ? maybe_inserted.unionAll(procedure.procedure_id).limit(1) : maybe_inserted
      },
    ).with(
      'inserting_procedure',
      (qb) =>
        procedure.if_not_already_exists
          ? qb.insertInto('patient_procedures')
            .columns(['id', 'employment_id'])
            .expression(
              qb.selectFrom('maybe_inserting_procedure_record').select([
                'id',
                literalString(employment_id).as('employment_id'),
              ]),
            )
          : procedure.create_with_specific_snomed_concept_id
          ? qb.insertInto('patient_procedures')
            .values({
              id: procedure_id,
              employment_id,
            })
          : blankSelection(qb),
    )
    .with(
      'inserting_findings',
      (qb) =>
        qb.insertInto('patient_findings').values(
          [
            ...findings_to_insert.map(({ record_id }) => ({
              id: record_id,
              procedure_id,
              patient_encounter_employee_id,
            })),
            ...measurements_to_insert.map(({ record_id }) => ({
              id: record_id,
              procedure_id,
              patient_encounter_employee_id,
            })),
          ],
        ),
    )
    /*
      The CTEs below return what they insert, or an empty selection of the same shape, so the
      due_to tagging can see the new rows: sibling CTEs share one snapshot, so RETURNING output is
      the only view of them. Their names are the DueToInputCtes contract in due_to.ts.
    */
    .with(
      'inserting_patient_measurements',
      (qb) =>
        measurements_to_insert.length
          ? qb.insertInto('patient_measurements').values(
            measurements_to_insert.map((m) => ({
              id: m.record_id,
              units: m.measurement_node.units,
              value: m.measurement_value.toFixed(),
            })),
          ).returningAll()
          : qb.selectFrom('patient_measurements').selectAll().where(literalBoolean(false)),
    )
    .with(
      'inserting_attribute_records',
      (qb) =>
        attribute_records.length
          ? qb.insertInto('patient_records').values(attribute_records).returningAll()
          : qb.selectFrom('patient_records').selectAll().where(literalBoolean(false)),
    ).with(
      'inserting_attribute_qualifier_links',
      (qb) =>
        attribute_records.length
          ? qb.insertInto('patient_record_qualifiers').values(attribute_qualifiers).returningAll()
          : qb.selectFrom('patient_record_qualifiers').selectAll().where(literalBoolean(false)),
    ).with(
      'inserting_patient_events',
      (qb) =>
        event_values.length
          ? qb.insertInto('patient_events').values(event_values).returningAll()
          : qb.selectFrom('patient_events').selectAll().where(literalBoolean(false)),
    ).with(
      'inserting_triage_level_records',
      (qb) => triage_level_records.length ? qb.insertInto('patient_records').values(triage_level_records) : blankSelection(qb),
    ).with(
      'inserting_triage_level_evaluations',
      (qb) =>
        triage_level_evaluations.length
          ? qb.insertInto('patient_evaluations').values(
            triage_level_evaluations,
          )
          : blankSelection(qb),
    ).with(
      'inserting_triage_levels',
      (qb) => triage_level_values.length ? qb.insertInto('patient_triage_level').values(triage_level_values) : blankSelection(qb),
    ).with(
      'inserting_triage_relation_records',
      (qb) => triage_relation_records.length ? qb.insertInto('patient_records').values(triage_relation_records) : blankSelection(qb),
    ).with(
      'inserting_triage_relations',
      (qb) => triage_relations.length ? qb.insertInto('patient_record_relations').values(triage_relations) : blankSelection(qb),
    ).with(
      'inserting_score_records',
      (qb) => score_records.length ? qb.insertInto('patient_records').values(score_records) : blankSelection(qb),
    ).with(
      'inserting_score_evaluations',
      (qb) =>
        score_evaluations.length
          ? qb.insertInto('patient_evaluations').values(
            score_evaluations,
          )
          : blankSelection(qb),
    ).with(
      'inserting_scores',
      (qb) => score_values.length ? qb.insertInto('patient_evaluation_scores').values(score_values) : blankSelection(qb),
    )

  return query
}

type InsertStatement = ReturnType<typeof insertSansDueTo>

// What the statement inserted, with the id of the procedure it is under
function selectInsertResult(
  query: InsertStatement,
  records: Array<PreparedFinding | PreparedMeasurement>,
): Promise<InsertResult> {
  return query
    .selectFrom('inserting_records')
    .innerJoin('procedure_record', (join) => join.onTrue())
    .groupBy('procedure_record.id')
    .select([
      'procedure_record.id as procedure_id',
      literalJsonArray(records.map(insertedRecord)).as('records'),
    ])
    .executeTakeFirstOrThrow()
}

export const patient_findings = base({
  top_level_table: 'patient_findings',
  baseQuery(
    trx: TrxOrDbOrQueryCreator,
    opts: PatientFindingsSearch,
  ) {
    let qb = patient_records.baseQuery(trx, opts)
      .innerJoin(
        'patient_findings',
        'patient_findings.id',
        'patient_records_aggregated.id',
      )
      .innerJoin(
        'patient_records_aggregated as procedures_aggregated',
        'patient_findings.procedure_id',
        'procedures_aggregated.id',
      )
      .select((eb) => [
        literalString('finding').$castTo<'finding'>().as('type'),
        'patient_findings.patient_encounter_employee_id',

        jsonBuildObject({
          id: eb.ref('procedures_aggregated.id'),
          root_snomed_concept_id: asText(eb, 'procedures_aggregated.root_snomed_concept_id'),
          root_snomed_concept_name: eb.ref('procedures_aggregated.root_snomed_concept_name'),
          root_snomed_concept_category: eb.ref('procedures_aggregated.root_snomed_concept_category'),
          specific_snomed_concept_id: asText(
            eb,
            'procedures_aggregated.specific_snomed_concept_id',
          ),
          specific_snomed_concept_name: eb.ref('procedures_aggregated.specific_snomed_concept_name'),
          specific_snomed_concept_category: eb.ref('procedures_aggregated.specific_snomed_concept_category'),
          workflow_step_name: caseWhenMatching(eb, eb.ref('procedures_aggregated.specific_snomed_concept_id'), SNOMED_CONCEPT_IDS_TO_WORKFLOW_NAMES),
        }).as('as_part_of_procedure'),

        eb.selectFrom('patient_evaluation_scores')
          .innerJoin(
            'patient_records as score_patient_records',
            'patient_evaluation_scores.id',
            'score_patient_records.id',
          )
          .innerJoin('patient_records_still_valid as score_valid', 'score_valid.id', 'score_patient_records.id')
          .innerJoin(
            'patient_evaluations as score_evaluations',
            'patient_evaluation_scores.id',
            'score_evaluations.id',
          )
          .whereRef(
            'score_evaluations.evaluates_record_id',
            '=',
            'patient_records_aggregated.id',
          )
          .select('patient_evaluation_scores.score')
          .orderBy('score_patient_records.created_at', 'desc')
          .limit(1)
          .as('score'),
      ])

    if (opts?.procedure_id) {
      qb = qb.where(
        'patient_findings.procedure_id',
        isString(opts.procedure_id) ? '=' : 'in',
        opts.procedure_id,
      )
    }
    if (!opts?.include_negative) {
      qb = qb.where(
        'patient_records_aggregated.existence',
        '=',
        'Yes',
      )
    }
    if (opts?.not_measurements) {
      qb = qb.leftJoin(
        'patient_measurements',
        'patient_findings.id',
        'patient_measurements.id',
      ).where('patient_measurements.id', 'is', null)
    }
    return qb
  },
  formatResult: (finding) => {
    if (finding.score != null) {
      tews_component.parse(finding.score)
    }

    return formatRecord(finding)
  },
  /*
    Inserts negative findings (value No or Unknown) in one statement. None can satisfy a due_to, so
    no due_to matching is in the statement: that matching cannot know the candidate set is empty,
    and costs as if it were not. Throws on a finding that is positive or carries a priority or score.
  */
  async insertManyNegative(
    trx: TrxOrDbOrQueryCreator,
    { findings, ...common }: InsertNegativeInput,
  ): Promise<InsertResult> {
    if (findings.length === 0) {
      throw new Error('insertManyNegative requires at least one finding')
    }
    const findings_to_insert = findings.map((finding) => {
      const prepared = prepareFinding(common, finding)
      const existence = asExistence(prepared.value_snomed_concept)
      if (existence === 'Yes') {
        throw new Error(
          `insertManyNegative only inserts negative findings (value No or Unknown), but ${prepared.specific_snomed_concept.name} has value ${
            prepared.value_snomed_concept?.name ?? 'null'
          }`,
        )
      }
      if (prepared.existence !== existence) {
        throw new Error(`insertManyNegative got existence ${prepared.existence} for a finding with value ${prepared.value_snomed_concept?.name}`)
      }
      if (prepared.priority || prepared.score != null) {
        throw new Error('insertManyNegative does not insert a priority or score, use insertOnePositive for a finding that has them')
      }
      return prepared
    })

    const query = insertSansDueTo(trx, { ...common, findings_to_insert, measurements_to_insert: [] })
    return await selectInsertResult(query, findings_to_insert)
  },

  /*
    Inserts one positive finding, tagging it with the due_tos it satisfies in the same statement.
    One at a time because a positive finding is matched against every due_to: the cost grows with
    the number of candidates in the statement, and nothing is gained by batching, since a record
    only ever matches a due_to through itself and its own qualifiers and attributes.
  */
  async insertOnePositive(
    trx: TrxOrDbOrQueryCreator,
    { finding, patient_age_determination, ...common }: InsertOnePositiveInput,
  ): Promise<InsertResult> {
    const prepared = prepareFinding(common, finding)
    if (isNegativeValue(prepared.value_snomed_concept)) {
      throw new Error(
        `insertOnePositive only inserts positive findings, but ${prepared.specific_snomed_concept.name} has value ${prepared.value_snomed_concept?.name}, use insertManyNegative`,
      )
    }

    const query = insertSansDueTo(trx, { ...common, findings_to_insert: [prepared], measurements_to_insert: [] })
    return await selectInsertResult(
      withTaggingOfInsertedRecords(query, { patient_age_determination, match_types: FINDING_MATCH_TYPES }),
      [prepared],
    )
  },

  // Inserts measurements, tagging them with the due_tos they satisfy in the same statement
  async insertMeasurements(
    trx: TrxOrDbOrQueryCreator,
    { measurements, patient_age_determination, ...common }: InsertMeasurementsInput,
  ): Promise<InsertResult> {
    if (measurements.length === 0) {
      throw new Error('insertMeasurements requires at least one measurement')
    }
    const measurements_to_insert = measurements.map((measurement) => prepareMeasurement(common, measurement))

    const query = insertSansDueTo(trx, { ...common, findings_to_insert: [], measurements_to_insert })
    return await selectInsertResult(
      withTaggingOfInsertedRecords(query, { patient_age_determination, match_types: MEASUREMENT_MATCH_TYPES }),
      measurements_to_insert,
    )
  },

  /*
    Inserts any mix of findings and measurements by dispatching to insertManyNegative (one
    statement for every negative finding), insertMeasurements (one statement) and
    insertOnePositive (one statement per positive finding), then merges the results.

    Prefer calling the precise method when the kind of record is known up front: a large batch
    of positive findings here silently becomes one statement per finding.

    Whenever that is more than one statement the procedure is resolved first, once, and every
    statement is linked to it. A single statement gets the caller's procedure as it is.

    The statements are not atomic with each other unless `trx` is a transaction, as it is in a
    request (backend/postHandler.ts), so a caller passing a plain `db` that fails part way is left
    with the statements that completed.
  */
  async insertMany(
    trx: TrxOrDbOrQueryCreator,
    { findings, measurements = [], procedure, ...common }: FindingsInsert,
  ) {
    if (findings.length === 0 && measurements.length === 0) {
      throw new Error('insertMany requires at least one finding or measurement')
    }

    // Each finding gets its id now, to find its result among the others and keep submission order
    const finding_nodes = findings.map((finding) => {
      const node: FindingNodeToInsert = typeof finding === 'string' ? parseWithSchema(finding, insertable_finding_base) : finding
      return { ...node, id: node.id || generateUUID() }
    })
    const negatives: NegativeFindingToInsert[] = []
    const positives: FindingNodeToInsert[] = []
    for (const node of finding_nodes) {
      if (isNegativeFinding(node)) negatives.push(node)
      else positives.push(node)
    }

    const statements = (negatives.length ? 1 : 0) + (measurements.length ? 1 : 0) + positives.length
    const shared = statements > 1
      ? await patient_procedures.ensureForWorkflowStep(trx, {
        patient_id: common.patient_id,
        patient_encounter_id: common.patient_encounter_id,
        employment_id: common.employment_id,
        procedure,
      })
      : null
    const insert_with = { ...common, procedure: shared ?? procedure }

    const [negative_result, measurements_result, positive_results] = await Promise.all([
      negatives.length ? patient_findings.insertManyNegative(trx, { ...insert_with, findings: negatives }) : null,
      measurements.length ? patient_findings.insertMeasurements(trx, { ...insert_with, measurements }) : null,
      pMap(positives, (finding) => patient_findings.insertOnePositive(trx, { ...insert_with, finding })),
    ])

    const results = compact([negative_result, measurements_result, ...positive_results])
    const first_result = results.find(() => true)
    assert(first_result)
    const { procedure_id } = first_result
    assert(results.every((result) => result.procedure_id === procedure_id), 'Every record is expected to be inserted under the same procedure')

    const finding_results = new Map(
      [negative_result, ...positive_results].flatMap((result) => result?.records ?? []).map((record) => [record.id, record]),
    )
    return {
      success: true as const,
      procedure_id,
      findings: finding_nodes.map(({ id }) => {
        const record = finding_results.get(id)
        assert(record, `No result for the finding ${id}`)
        return record
      }),
      measurements: measurements_result?.records ?? [],
    }
  },
  QUALIFIERS_BY_EXISTENCE: {
    Yes: YES_QUALIFIER,
    No: NO_QUALIFIER,
    Unknown: UNKNOWN_QUALIFIER,
  },
})
