import { IdSelectable, IdSelection, InsertRows, Priority, TrxOrDbOrQueryCreator } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { idSelection, jsonArrayFrom, literalBoolean } from '../helpers.ts'
import { base } from './_base.ts'
import { patient_record_qualifiers } from './patient_record_qualifiers.ts'
import { buildExpression, maybeSnomedConceptBase, snomedConceptBase } from './s_expression.ts'
import { Lang, QueryableSingleNode } from '../../shared/s_expression_schemas.ts'
import assertHasProperty from '../../util/assertHasProperty.ts'
import { formatRecord } from '../../shared/patient_records.ts'
import { QUALIFIER_VALUE } from '../../shared/snomed_concepts.ts'
import { IntermediateBaseRecord, nonGroupedBaseQuery } from './patient_records_base.ts'
import { ExpressionBuilder, RawBuilder, sql } from 'kysely'
import { assert } from 'std/assert/assert.ts'
import isString from '../../util/isString.ts'
import { DB } from '../../db.d.ts'
import type { InsertedRecordCtes } from './due_to.ts'

export type PatientRecordsSearch = {
  patient_id?: string | IdSelection
  patient_encounter_id?: string | IdSelection
  root_snomed_concept_id?: string | string[]
  specific_snomed_concept_id?: IdSelectable
  s_expression?: string | QueryableSingleNode
  excluding_patient_encounter_id?: string | IdSelection
  search?: string
  include_invalid?: boolean
  before?: RawBuilder<Date> | Date
}

type RecordInsert = {
  patient_id: string
  patient_encounter_id: string
  record_id?: string
  root_snomed_concept: Lang['snomed_concept']
  specific_snomed_concept: Lang['snomed_concept']
  value_snomed_concept: Lang['snomed_concept'] | null
  qualifiers?: Lang['qualifier'][]
}

export function baseInsert(
  trx: TrxOrDbOrQueryCreator,
  { patient_id, patient_encounter_id, record_id = generateUUID(), root_snomed_concept, specific_snomed_concept, value_snomed_concept, qualifiers, attributes }:
    RecordInsert,
) {
  return baseInsertMany(trx, [{
    patient_id,
    patient_encounter_id,
    record_id,
    root_snomed_concept,
    specific_snomed_concept,
    value_snomed_concept,
    qualifiers,
  }])
}

type RecordInsertMany = {
  patient_id: string
  patient_encounter_id: string
  record_id: string
  root_snomed_concept: Lang['snomed_concept']
  specific_snomed_concept: Lang['snomed_concept']
  value_snomed_concept: Lang['snomed_concept'] | null
  qualifiers?: Lang['qualifier'][]
}

export function baseInsertMany(
  trx: TrxOrDbOrQueryCreator,
  records: RecordInsertMany[],
) {
  if (records.length === 0) {
    throw new Error('baseInsertMany requires at least one record')
  }

  // Collect all patient_records inserts and qualifier inserts
  const patient_record_rows: InsertRows<'patient_records'> = []
  const qualifier_record_rows: InsertRows<'patient_records'> = []
  const qualifier_link_rows: InsertRows<'patient_record_qualifiers'> = []

  function collectQualifiers(
    qualifier: Lang['qualifier'],
    qualifies_record_id: string,
    patient_id: string,
    patient_encounter_id: string,
  ) {
    assertHasProperty(qualifier, 'specific_snomed_concept')
    const qualifier_id = generateUUID()

    qualifier_record_rows.push({
      id: qualifier_id,
      patient_id,
      patient_encounter_id,
      root_snomed_concept_id: QUALIFIER_VALUE.id,
      specific_snomed_concept_id: snomedConceptBase(
        trx,
        qualifier.specific_snomed_concept,
      ),
    })

    qualifier_link_rows.push({
      id: qualifier_id,
      qualifies_record_id,
    })

    for (const sub_qualifier of qualifier.qualifiers) {
      collectQualifiers(
        sub_qualifier,
        qualifier_id,
        patient_id,
        patient_encounter_id,
      )
    }
  }

  // Collect all values
  for (const record of records) {
    const {
      patient_id,
      patient_encounter_id,
      record_id,
      root_snomed_concept,
      specific_snomed_concept,
      value_snomed_concept,
      qualifiers = [],
    } = record

    patient_record_rows.push({
      id: record_id,
      patient_id,
      patient_encounter_id,
      root_snomed_concept_id: snomedConceptBase(trx, root_snomed_concept),
      specific_snomed_concept_id: snomedConceptBase(
        trx,
        specific_snomed_concept,
      ),
      value_snomed_concept_id: maybeSnomedConceptBase(
        trx,
        value_snomed_concept,
      ),
    })

    for (const qualifier of qualifiers) {
      collectQualifiers(qualifier, record_id, patient_id, patient_encounter_id)
    }
  }

  /*
    Build query with one CTE per table. Each CTE returns the rows it inserted (or an empty
    selection of the same shape) so that later CTEs in the same statement can see the new
    rows: sibling CTEs all share one snapshot, so reading the tables themselves would miss them.
  */
  return trx.with(
    'inserting_records',
    (qb) => qb.insertInto('patient_records').values(patient_record_rows).returningAll(),
  )
    .with(
      'inserting_qualifier_records',
      (qb) =>
        qualifier_record_rows.length
          ? qb.insertInto('patient_records').values(qualifier_record_rows).returningAll()
          : qb.selectFrom('patient_records').selectAll().where(literalBoolean(false)),
    ).with(
      'inserting_qualifier_links',
      (qb) =>
        qualifier_record_rows.length
          ? qb.insertInto('patient_record_qualifiers').values(qualifier_link_rows).returningAll()
          : qb.selectFrom('patient_record_qualifiers').selectAll().where(literalBoolean(false)),
    )
}

export function priorityQuery(eb: ExpressionBuilder<DB, 'patient_records_aggregated'>) {
  return eb.selectFrom('patient_triage_level')
    .innerJoin(
      'patient_records as triage_patient_records',
      'patient_triage_level.id',
      'triage_patient_records.id',
    )
    .innerJoin('patient_records_still_valid as triage_valid', 'triage_valid.id', 'triage_patient_records.id')
    .innerJoin(
      'patient_record_relations as triage_relations',
      'triage_relations.source_id',
      'patient_triage_level.id',
    )
    .innerJoin(
      'snomed_inferred_canonical_name_and_category as triage_snomed_inferred_canonical_name_and_category',
      'triage_patient_records.value_snomed_concept_id',
      'triage_snomed_inferred_canonical_name_and_category.id',
    )
    .whereRef(
      'triage_relations.destination_id',
      '=',
      'patient_records_aggregated.id',
    )
    .select('triage_snomed_inferred_canonical_name_and_category.name')
    .orderBy('triage_patient_records.created_at', 'desc')
    .limit(1)
    .$castTo<Priority | null>()
    .as('priority')
}

export const patient_records = base({
  top_level_table: 'patient_records',
  baseQuery(
    trx: TrxOrDbOrQueryCreator,
    opts: PatientRecordsSearch,
  ) {
    let qb = nonGroupedBaseQuery(trx, { include_invalid: opts?.include_invalid })
      .select((eb) => [
        jsonArrayFrom(
          trx.selectFrom(
            nonGroupedBaseQuery(trx).as('evaluation_records'),
          )
            .innerJoin(
              'patient_evaluations',
              'evaluation_records.id',
              'patient_evaluations.id',
            )
            .whereRef(
              'patient_evaluations.evaluates_record_id',
              '=',
              eb.ref('patient_records_aggregated.id'),
            ).selectAll('evaluation_records'),
        ).as('evaluations'),

        priorityQuery(eb),

        jsonArrayFrom(
          eb.selectFrom('patient_record_relations')
            .innerJoin(
              'patient_records_aggregated as relation_records',
              'relation_records.id',
              'patient_record_relations.id',
            )
            .innerJoin(
              'patient_records_aggregated as destination_records',
              'destination_records.id',
              'patient_record_relations.destination_id',
            )
            .whereRef(
              'patient_record_relations.source_id',
              '=',
              'patient_records_aggregated.id',
            )
            .selectAll('destination_records')
            .select('relation_records.specific_snomed_concept_id as relation_snomed_concept_id')
            .select('relation_records.specific_snomed_concept_name as relation_name')
            .select((eb) => [
              jsonArrayFrom(
                patient_record_qualifiers.baseQuery(trx, 'qualifiers_1' as const)
                  .where(
                    'qualifiers_1.qualifies_record_id',
                    '=',
                    eb.ref('destination_records.id'),
                  )
                  .select((_eb_qualifiers_1) => [
                    sql<IntermediateBaseRecord[]>`ARRAY[]::int[]`.as(
                      'qualifiers',
                    ),
                  ]),
              ).as('qualifiers'),
            ]),
        ).as('destination_relations'),

        // jsonArrayFrom(
        //   eb.selectFrom('patient_record_relations')
        //     .innerJoin(
        //       nonGroupedBaseQuery(trx).as('relation_records'),
        //       'relation_records.id',
        //       'patient_record_relations.id',
        //     )
        //     .innerJoin(
        //       'patient_records_aggregated as source_records',
        //       'source_records.id',
        //       'patient_record_relations.source_id',
        //     )
        //     .whereRef(
        //       'patient_record_relations.destination_id',
        //       '=',
        //       'patient_records_aggregated.id',
        //     )
        //     .selectAll('source_records')
        //     .select('relation_records.specific_snomed_concept_id as relation_snomed_concept_id')
        //     .select('relation_records.specific_snomed_concept_name as relation_name'),
        // ).as('source_relations'),

        jsonArrayFrom(
          patient_record_qualifiers.baseQuery(trx, 'qualifiers_1' as const)
            .where(
              'qualifiers_1.qualifies_record_id',
              '=',
              eb.ref('patient_records_aggregated.id'),
            )
            .select((eb_qualifiers_1) => [
              jsonArrayFrom(
                patient_record_qualifiers.baseQuery(trx, 'qualifiers_2' as const)
                  .where(
                    'qualifiers_2.qualifies_record_id',
                    '=',
                    eb_qualifiers_1.ref('qualifiers_1.id'),
                  )
                  .select((eb_qualifiers_2) => [
                    jsonArrayFrom(
                      patient_record_qualifiers.baseQuery(
                        trx,
                        'qualifiers_3' as const,
                      )
                        .where(
                          'qualifiers_3.qualifies_record_id',
                          '=',
                          eb_qualifiers_2.ref('qualifiers_2.id'),
                        )
                        .select((eb_qualifiers_3) => [
                          jsonArrayFrom(
                            patient_record_qualifiers.baseQuery(
                              trx,
                              'qualifiers_4' as const,
                            )
                              .where(
                                'qualifiers_4.qualifies_record_id',
                                '=',
                                eb_qualifiers_3.ref('qualifiers_3.id'),
                              )
                              .select((_eb_qualifiers_4) => [
                                // At max depth, just return an empty array, satisfying the typedefs
                                sql<IntermediateBaseRecord[]>`ARRAY[]::int[]`.as(
                                  'qualifiers',
                                ),
                              ]),
                          ).as('qualifiers'),
                        ]),
                    ).as('qualifiers'),
                  ]),
              ).as('qualifiers'),
            ]),
        ).as('qualifiers'),
      ])

    if (opts?.patient_id) {
      qb = qb.where(
        'patient_records_aggregated.patient_id',
        '=',
        opts.patient_id,
      )
    }
    if (opts?.patient_encounter_id) {
      qb = qb.where(
        'patient_records_aggregated.patient_encounter_id',
        '=',
        opts.patient_encounter_id,
      )
    }
    if (opts?.root_snomed_concept_id) {
      qb = qb.where(
        'patient_records_aggregated.root_snomed_concept_id',
        isString(opts.root_snomed_concept_id) ? '=' : 'in',
        opts.root_snomed_concept_id,
      )
    }
    if (opts?.specific_snomed_concept_id) {
      qb = qb.where(
        'patient_records_aggregated.specific_snomed_concept_id',
        ...idSelection(opts.specific_snomed_concept_id),
      )
    }
    if (opts?.s_expression) {
      assert(opts.patient_id, 'Must have patient id when using s_expression')
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
    if (opts?.excluding_patient_encounter_id) {
      qb = qb.where('patient_records_aggregated.patient_encounter_id', '!=', opts.excluding_patient_encounter_id)
    }
    if (opts?.before) {
      qb = qb.where(
        'patient_records_aggregated.created_at',
        '<',
        opts.before,
      )
    }

    return qb
  },
  formatResult: formatRecord,
  baseInsert,
})
