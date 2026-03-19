import { ExtantProcedureOrCreationIntent, IdSelection, InsertRows, Maybe, TrxOrDbOrQueryCreator } from '../../types.ts'
import { asText, blankSelection, caseWhenMatching, jsonBuildObject, literalString, literalUUIDArray, success_true } from '../helpers.ts'
import generateUUID from '../../util/uuid.ts'
import { baseInsertMany, patient_records, PatientRecordsSearch } from './patient_records.ts'
import { sql } from 'kysely'
import { base, QueryResult } from './_base.ts'

import { maybeSnomedConceptBase, satisfyingSExpression, snomedConceptBase } from './s_expression.ts'
import { Priority, PRIORITY_SNOMED_CODES, TARGET_TIME_TO_TREATMENT_MINUTES } from '../../shared/priorities.ts'
import { tews_component } from '../../util/validators.ts'
import assertHasProperty from '../../util/assertHasProperty.ts'
import { InsertableFindingBase, Lang, MeasurementComparison } from '../../shared/s_expression_schemas.ts'
import { asNode } from '../../shared/s_expression.ts'
import { formatRecord } from '../../shared/patient_records.ts'
import {
  ATTRIBUTE,
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

import { SNOMED_CONCEPT_IDS_TO_WORKFLOW_NAMES } from '../../shared/workflow.ts'

export type PatientFindingsSearch = PatientRecordsSearch & {
  procedure_id?: string | IdSelection
  s_expression?: string | Lang['finding']
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

type FindingInsert = InsertCommon & {
  procedure_id: string
  finding: FindingNodeToInsert | string
}
type FindingsInsert = InsertCommon & {
  employment_id: string
  procedure: ExtantProcedureOrCreationIntent
  findings: Array<FindingNodeToInsert | string>
  measurements?: Array<MeasurementToInsert>
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
  insertMany(
    trx: TrxOrDbOrQueryCreator,
    {
      patient_id,
      patient_encounter_id,
      employment_id,
      patient_encounter_employee_id,
      procedure,
      findings,
      measurements = [],
    }: FindingsInsert,
  ) {
    if (findings.length === 0 && measurements.length === 0) {
      throw new Error('insertMany requires at least one finding or measurement')
    }

    const procedure_id = procedure.procedure_id || generateUUID()

    // Parse findings and generate IDs
    const findings_to_insert = findings.map((finding) => {
      const finding_node = asNode(finding, 'finding')
      assertHasProperty(finding_node, 'root_snomed_concept')
      assertHasProperty(finding_node, 'specific_snomed_concept')
      const priority = typeof finding === 'object' && 'priority' in finding ? finding.priority : undefined
      const score = typeof finding === 'object' && 'score' in finding ? finding.score : undefined
      return {
        patient_id,
        patient_encounter_id,
        record_id: generateUUID(),
        ...finding_node,
        priority,
        score,
      }
    })

    const measurements_to_insert = measurements.map((measurement) => {
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
    })

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
            root_snomed_concept_id: ATTRIBUTE.id,
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

    return baseInsertMany(trx, records_to_insert)
      .with(
        'inserting_procedure_record',
        (qb) =>
          procedure.create_with_specific_snomed_concept_id
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
        'inserting_procedure',
        (qb) =>
          procedure.create_with_specific_snomed_concept_id
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
      ).with(
        'inserting_measurements',
        (qb) =>
          measurements_to_insert.length
            ? qb.insertInto('patient_measurements').values(
              measurements_to_insert.map((m) => ({
                id: m.record_id,
                units: m.measurement_node.units,
                value: m.measurement_value.toFixed(),
              })),
            )
            : blankSelection(qb),
      )
      .with(
        'inserting_attribute_records',
        (qb) => attribute_records.length ? qb.insertInto('patient_records').values(attribute_records) : blankSelection(qb),
      ).with(
        'inserting_attribute_qualifier_links',
        (qb) =>
          attribute_records.length
            ? qb.insertInto('patient_record_qualifiers').values(
              attribute_qualifiers,
            )
            : blankSelection(qb),
      ).with(
        'inserting_events',
        (qb) => event_values.length ? qb.insertInto('patient_events').values(event_values) : blankSelection(qb),
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
      ).selectFrom('inserting_records')
      .innerJoin('inserting_procedure_record', (join) => join.onTrue())
      .groupBy('inserting_procedure_record.id')
      .select([
        success_true,
        'inserting_procedure_record.id as procedure_id',
        literalUUIDArray(findings_to_insert.map((f) => f.record_id)).as('finding_ids'),
        literalUUIDArray(measurements_to_insert.map((m) => m.record_id)).as('measurement_ids'),
      ])
      .executeTakeFirstOrThrow()
  },
  insertOneNested(
    trx: TrxOrDbOrQueryCreator,
    {
      patient_id,
      patient_encounter_id,
      patient_encounter_employee_id,
      procedure_id,
      finding,
    }: FindingInsert,
  ) {
    const finding_node = asNode(finding, 'finding')
    assertHasProperty(finding_node, 'root_snomed_concept')
    assertHasProperty(finding_node, 'specific_snomed_concept')

    const finding_id = generateUUID()

    let query = patient_records.baseInsert(
      trx,
      {
        patient_id,
        patient_encounter_id,
        record_id: finding_id,
        ...finding_node,
      },
    ).with('inserting_findings', (qb) =>
      qb.insertInto('patient_findings')
        .values({
          id: finding_id,
          procedure_id,
          patient_encounter_employee_id,
        }))

    for (const attribute of finding_node.attributes) {
      query = attributeCte(query, attribute)
    }

    const select_query = query.selectNoFrom([
      success_true,
      sql<true>`true`.as('inserted_new'),
      literalString(finding_id).as('finding_id'),
    ])

    return select_query
      .executeTakeFirstOrThrow()

    function attributeCte(
      qb: typeof query,
      attribute: Lang['attribute'],
    ) {
      const attribute_id = generateUUID()
      const id_token = attribute_id.replaceAll('-', '_')
      const { value } = attribute

      // Event-type attribute
      if (value?.atom === 'event') {
        return qb.with(
          `inserting_event_record_${id_token}`,
          (qb) =>
            qb.insertInto('patient_records')
              .values({
                id: attribute_id,
                patient_id,
                patient_encounter_id,
                root_snomed_concept_id: EVENT.id,
                specific_snomed_concept_id: snomedConceptBase(
                  trx,
                  attribute.specific_snomed_concept,
                ),
                value_snomed_concept_id: null,
              }),
        ).with(
          `inserting_event_qualifier_${id_token}`,
          (qb) =>
            qb.insertInto('patient_record_qualifiers')
              .values({
                id: attribute_id,
                qualifies_record_id: finding_id,
              }),
        ).with(
          `inserting_event_${id_token}`,
          (qb) =>
            qb.insertInto('patient_events')
              .values({
                id: attribute_id,
                datetime: value.datetime,
              }),
        ) as unknown as typeof query
      }

      return qb.with(
        `inserting_attribute_record_${id_token}`,
        (qb) =>
          qb.insertInto('patient_records')
            .values({
              id: attribute_id,
              patient_id,
              patient_encounter_id,
              root_snomed_concept_id: ATTRIBUTE.id,
              specific_snomed_concept_id: snomedConceptBase(
                trx,
                attribute.specific_snomed_concept,
              ),
              value_snomed_concept_id: maybeSnomedConceptBase(trx, value),
            }),
      ).with(
        `inserting_attribute_qualifier_${id_token}`,
        (qb) =>
          qb.insertInto('patient_record_qualifiers')
            .values({
              id: attribute_id,
              qualifies_record_id: finding_id,
            }),
      ) as unknown as typeof query
    }
  },
  async insertOneIfNotAlreadyExistsForThisEncounter(
    trx: TrxOrDbOrQueryCreator,
    insert: FindingInsert,
  ) {
    const already_exists = await satisfyingSExpression(
      trx,
      {
        patient_id: insert.patient_id,
        patient_encounter_id: insert.patient_encounter_id,
        s_expression: insert.finding,
      },
    )

    if (already_exists.satisfies) {
      return {
        success: true,
        inserted_new: false,
        finding_id: already_exists.record_ids[0],
      }
    }

    return patient_findings.insertOneNested(trx, insert)
  },
  QUALIFIERS_BY_EXISTENCE: {
    Yes: YES_QUALIFIER,
    No: NO_QUALIFIER,
    Unknown: UNKNOWN_QUALIFIER,
  },
})
