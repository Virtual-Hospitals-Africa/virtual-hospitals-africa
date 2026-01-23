import { ExtantProcedureOrCreationIntent, IdSelection, InsertRows, Maybe, TrxOrDb, TrxOrDbOrQueryCreator } from '../../types.ts'
import { arrayAggIds, asText, blankSelection, caseWhenMatching, debugLog, jsonBuildObject, literalString, success_true } from '../helpers.ts'
import generateUUID from '../../util/uuid.ts'
import { baseInsertMany, patient_records } from './patient_records.ts'
import { RawBuilder, sql } from 'kysely'
import { base, QueryResult } from './_base.ts'
import { assert } from 'std/assert/assert.ts'
import { buildExpression, maybeSnomedConceptBase, satisfyingSExpression, snomedConceptBase } from './s_expression.ts'
import { Priority, PRIORITY_SNOMED_CODES, TARGET_TIME_TO_TREATMENT_MINUTES } from '../../shared/priorities.ts'
import { tews_component } from '../../util/validators.ts'
import assertHasProperty from '../../util/assertHasProperty.ts'
import { Lang } from '../../shared/s_expression_schemas.ts'
import { asNode } from '../../shared/s_expression.ts'
import { formatRecord } from '../../shared/patient_records.ts'
import { ATTRIBUTE, EVALUATION_ACTION, EVENT, NO_QUALIFIER, PRIORITY, PROCEDURE, UNKNOWN_QUALIFIER, YES_QUALIFIER } from '../../shared/snomed_concepts.ts'
import isString from '../../util/isString.ts'

import { SNOMED_CONCEPT_IDS_TO_WORKFLOW_NAMES } from '../../shared/workflow.ts'

export function baseQuery(
  trx: TrxOrDbOrQueryCreator,
) {
  return patient_records.baseQuery(trx)
    .innerJoin(
      'patient_findings',
      'patient_findings.id',
      'patient_records_aggregated.id',
    )
    .innerJoin(
      'patient_procedures',
      'patient_findings.procedure_id',
      'patient_procedures.id',
    )
    .innerJoin(
      'patient_records as patient_procedure_records',
      'patient_procedures.id',
      'patient_procedure_records.id',
    )
    .innerJoin(
      'snomed_inferred_canonical_name_and_category as procedure_root_snomed_concept',
      'patient_procedure_records.root_snomed_concept_id',
      'procedure_root_snomed_concept.id',
    )
    .innerJoin(
      'snomed_inferred_canonical_name_and_category as procedure_specific_snomed_concept',
      'patient_procedure_records.specific_snomed_concept_id',
      'procedure_specific_snomed_concept.id',
    )
    .select((eb) => [
      literalString('finding').$castTo<'finding'>().as('type'),
      'patient_findings.patient_encounter_employee_id',

      jsonBuildObject({
        id: eb.ref('patient_procedure_records.id'),
        root_snomed_concept_id: asText(
          eb,
          'procedure_root_snomed_concept.id',
        ),
        root_snomed_concept_name: eb.ref(
          'procedure_root_snomed_concept.name',
        ),
        root_snomed_concept_category: eb.ref(
          'procedure_root_snomed_concept.category',
        ),
        specific_snomed_concept_id: asText(
          eb,
          'procedure_specific_snomed_concept.id',
        ),
        specific_snomed_concept_name: eb.ref(
          'procedure_specific_snomed_concept.name',
        ),
        specific_snomed_concept_category: eb.ref(
          'procedure_specific_snomed_concept.category',
        ),
        workflow_step_name: caseWhenMatching(eb, eb.ref('procedure_specific_snomed_concept.id'), SNOMED_CONCEPT_IDS_TO_WORKFLOW_NAMES),
      }).as('as_part_of_procedure'),

      eb.selectFrom('patient_triage_level')
        .innerJoin(
          'patient_records as triage_patient_records',
          'patient_triage_level.id',
          'triage_patient_records.id',
        )
        .innerJoin('patient_records_still_valid as triage_valid', 'triage_valid.id', 'triage_patient_records.id')
        .innerJoin(
          'patient_evaluations as triage_evaluations',
          'patient_triage_level.id',
          'triage_evaluations.id',
        )
        .innerJoin(
          'snomed_inferred_canonical_name_and_category as triage_snomed_inferred_canonical_name_and_category',
          'triage_patient_records.value_snomed_concept_id',
          'triage_snomed_inferred_canonical_name_and_category.id',
        )
        .whereRef(
          'triage_evaluations.evaluates_record_id',
          '=',
          'patient_records_aggregated.id',
        )
        .select('triage_snomed_inferred_canonical_name_and_category.name')
        .$castTo<Priority | null>()
        .as('priority'),

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
}

export type IntermediateFinding = QueryResult<typeof baseQuery>
export type PatientFindingsSearch = {
  patient_id?: string | IdSelection
  patient_encounter_id?: string | IdSelection
  procedure_id?: string | IdSelection
  s_expression?: string | Lang['finding']
  search?: string
  not_measurements?: boolean
  include_negative?: boolean
  before?: RawBuilder<Date> | Date
}

type InsertCommon = {
  patient_id: string
  patient_encounter_id: string
  patient_encounter_employee_id: string
}

export type FindingNodeToInsert = Lang['finding'] & {
  priority?: Maybe<{
    level: Priority
    by_system: boolean
  }>
  score?: number
}
type FindingInsert = InsertCommon & {
  procedure_id: string
  finding: FindingNodeToInsert | string
}
type FindingsInsert = InsertCommon & {
  employment_id: string
  procedure: ExtantProcedureOrCreationIntent
  findings: Array<FindingNodeToInsert | string>
}

export const patient_findings = base({
  top_level_table: 'patient_findings',
  baseQuery,
  formatResult: (finding) => {
    if (finding.priority) {
      assert(finding.score == null, 'Use score or priority, but not both')
    }
    if (finding.score != null) {
      tews_component.parse(finding.score)
    }

    return formatRecord(finding)
  },
  handleSearch(
    qb,
    opts: PatientFindingsSearch,
    trx,
  ) {
    assert(!opts.search, 'TODO support')
    // if (opts.search) {
    //   qb = qb.where(
    //     'snomed_inferred_canonical_name_and_category.name',
    //     'ilike',
    //     `%${opts.search}%`,
    //   )
    // }
    if (opts.patient_id) {
      qb = qb.where(
        'patient_records_aggregated.patient_id',
        '=',
        opts.patient_id,
      )
    }
    if (opts.patient_encounter_id) {
      qb = qb.where(
        'patient_records_aggregated.patient_encounter_id',
        '=',
        opts.patient_encounter_id,
      )
    }
    if (opts.procedure_id) {
      qb = qb.where(
        'patient_findings.procedure_id',
        isString(opts.procedure_id) ? '=' : 'in',
        opts.procedure_id,
      )
    }
    if (!opts.include_negative) {
      qb = qb.where(
        'patient_records_aggregated.existence',
        '=',
        'Yes',
      )
    }
    if (opts.not_measurements) {
      qb = qb.leftJoin(
        'patient_measurements',
        'patient_findings.id',
        'patient_measurements.id',
      ).where('patient_measurements.id', 'is', null)
    }
    if (opts.s_expression) {
      assert(opts.patient_id)
      qb = qb.where(
        'patient_records_aggregated.id',
        'in',
        buildExpression(
          trx,
          {
            patient_id: opts.patient_id,
            patient_encounter_id: opts.patient_encounter_id,
          },
          opts.s_expression,
        ),
      )
    }
    if (opts.before) {
      qb = qb.where(
        'patient_records_aggregated.created_at',
        '<',
        opts.before,
      )
    }

    return qb
  },
  insertMany(
    trx: TrxOrDb,
    {
      patient_id,
      patient_encounter_id,
      employment_id,
      patient_encounter_employee_id,
      procedure,
      findings,
    }: FindingsInsert,
  ) {
    if (findings.length === 0) {
      throw new Error('insertMany requires at least one finding')
    }

    console.log('ffkkkkkk', procedure)

    const procedure_id = procedure.procedure_id || generateUUID()

    // Parse findings and generate IDs
    const records = findings.map((finding) => {
      const finding_node = asNode(finding, 'finding')
      assertHasProperty(finding_node, 'root_snomed_concept')
      assertHasProperty(finding_node, 'specific_snomed_concept')
      const priority = typeof finding === 'object' && 'priority' in finding ? finding.priority : undefined
      return {
        patient_id,
        patient_encounter_id,
        record_id: generateUUID(),
        ...finding_node,
        priority,
      }
    })

    const attribute_records: InsertRows<'patient_records'> = []
    const attribute_qualifiers: InsertRows<'patient_record_qualifiers'> = []
    const event_values: InsertRows<'patient_events'> = []
    const triage_level_records: InsertRows<'patient_records'> = []
    const triage_level_evaluations: InsertRows<'patient_evaluations'> = []
    const triage_level_values: InsertRows<'patient_triage_level'> = []

    for (const { record_id, attributes, priority } of records) {
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
          evaluates_record_id: record_id,
          employment_id: priority.by_system ? null : employment_id,
          by_system: priority.by_system,
          procedure_id,
        })

        triage_level_values.push({
          id: triage_level_evaluation_id,
          target_treatment_time: sql<Date>`now() + interval '${sql.raw(target_treatment_minutes.toString())} minutes'`,
        })
      }
    }

    debugLog(
      baseInsertMany(trx, records)
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
                  by_system: false,
                })
              : blankSelection(qb),
        )
        .with(
          'inserting_findings',
          (qb) =>
            qb.insertInto('patient_findings').values(
              records.map(({ record_id }) => ({
                id: record_id,
                procedure_id,
                patient_encounter_employee_id,
              })),
            ),
        ).with(
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
        ).selectFrom('inserting_records')
        .innerJoin('inserting_procedure_record', (join) => join.onTrue())
        .groupBy('inserting_procedure_record.id')
        .select((eb) => [
          success_true,
          'inserting_procedure_record.id as procedure_id',
          arrayAggIds(eb.ref('inserting_records.id')).as('finding_ids'),
        ]),
    )

    return baseInsertMany(trx, records)
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
                by_system: false,
              })
            : blankSelection(qb),
      )
      .with(
        'inserting_findings',
        (qb) =>
          qb.insertInto('patient_findings').values(
            records.map(({ record_id }) => ({
              id: record_id,
              procedure_id,
              patient_encounter_employee_id,
            })),
          ),
      ).with(
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
      ).selectFrom('inserting_records')
      .innerJoin('inserting_procedure_record', (join) => join.onTrue())
      .groupBy('inserting_procedure_record.id')
      .select((eb) => [
        success_true,
        'inserting_procedure_record.id as procedure_id',
        arrayAggIds(eb.ref('inserting_records.id')).as('finding_ids'),
      ])
      .executeTakeFirstOrThrow()
  },
  insertOneNested(
    trx: TrxOrDb,
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
    trx: TrxOrDb,
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
