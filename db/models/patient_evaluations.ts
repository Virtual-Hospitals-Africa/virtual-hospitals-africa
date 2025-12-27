import { QueryCreator, sql } from 'kysely'
import { IdSelection, TrxOrDb } from '../../types.ts'
import { literalString, success_true } from '../helpers.ts'
import generateUUID from '../../util/uuid.ts'
import {
  ParsedExpressionOf,
  parseExpressionExpectingAtom,
} from '../../shared/s_expression.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { patient_records } from './patient_records.ts'
import { base } from './_base.ts'
import { assert } from 'std/assert/assert.ts'
import { buildExpression } from './s_expression.ts'
import isString from '../../util/isString.ts'
import { DB } from '../../db.d.ts'

export type PatientEvaluationInsert =
  & {
    evaluation_id?: string
    patient_id: string
    patient_encounter_id: string
    evaluates_record_id: string
    evaluation: string | ParsedExpressionOf<'evaluation'>
  }
  & (
    {
      employment_id: string
      by_system?: never
    } | {
      employment_id?: never
      by_system: true
    }
  )

export function insertOneNestedQuery(
  trx: TrxOrDb,
  {
    evaluation_id = generateUUID(),
    patient_id,
    patient_encounter_id,
    evaluates_record_id,
    evaluation,
    employment_id,
    by_system,
  }: PatientEvaluationInsert,
) {
  const { snomed_concept_id, value_snomed_concept_id, qualifiers } =
    isString(evaluation)
      ? parseExpressionExpectingAtom(evaluation, 'evaluation')
      : evaluation

  let query = trx.with(
    'inserting_record',
    (qb) =>
      qb.insertInto('patient_records')
        .values({
          id: evaluation_id,
          patient_id,
          patient_encounter_id,
          snomed_concept_id,
          value_snomed_concept_id,
        }).returning('id'),
  ).with(
    'inserting_evaluation',
    (qb) =>
      qb.insertInto('patient_evaluations')
        .values({
          id: evaluation_id,
          employment_id,
          evaluates_record_id,
          by_system: by_system || false,
        }),
  )

  function qualifierCte(
    qb: typeof query,
    qualifier:
      | ParsedExpressionOf<'qualifier'>
      | ParsedExpressionOf<'not_qualifier'>,
    qualifies_record_id: string,
  ) {
    if (qualifier.atom !== 'qualifier') {
      assertEquals(
        qualifier.atom,
        'not_qualifier',
        'we can omit not_qualifier expressions upon insert, but not sure what is going on here',
      )
      return qb
    }
    const id = generateUUID()
    const id_token = id.replaceAll('-', '_')

    let next_query = qb.with(
      `inserting_qualifier_record_${id_token}`,
      (qb) =>
        qb.insertInto('patient_records')
          .values({
            id,
            patient_id,
            patient_encounter_id,
            snomed_concept_id: qualifier.snomed_concept_id,
            value_snomed_concept_id: qualifier.value_snomed_concept_id,
          }),
    ).with(
      `inserting_qualifiers_${id_token}`,
      (qb) =>
        qb.insertInto('patient_record_qualifiers')
          .values({
            id,
            qualifies_record_id,
          }),
    ) as unknown as typeof query

    for (const sub_qualifier of qualifier.qualifiers) {
      next_query = qualifierCte(
        next_query,
        sub_qualifier,
        id,
      ) as unknown as typeof query
    }

    return next_query
  }

  for (const qualifier of qualifiers) {
    query = qualifierCte(query, qualifier, evaluation_id)
  }

  return query
}

export function insertOneNested(
  trx: TrxOrDb,
  to_insert: PatientEvaluationInsert,
) {
  return insertOneNestedQuery(trx, to_insert).selectFrom('inserting_record')
    .select([
      success_true,
      sql<true>`true`.as('inserted_new'),
      'inserting_record.id as evaluation_id',
    ])
}

export function baseQuery(
  trx: TrxOrDb | QueryCreator<DB>,
) {
  return patient_records.baseQuery(trx).innerJoin(
    'patient_evaluations',
    'patient_evaluations.id',
    'patient_records.id',
  )
    .select([
      literalString('evaluation').$castTo<'evaluation'>().as('type'),
      'patient_evaluations.employment_id',
      'patient_evaluations.by_system',
      'patient_evaluations.evaluates_record_id',
    ])
}

type PatientEvaluationsSearch = {
  patient_id: string | IdSelection
  patient_encounter_id?: string | IdSelection
  s_expression?: string | ParsedExpressionOf<'evaluation'>
  search?: string
}

export const patient_evaluations = base({
  top_level_table: 'patient_evaluations',
  baseQuery,
  formatResult: (x) => x,
  handleSearch(
    qb,
    opts: PatientEvaluationsSearch,
    trx,
  ) {
    assert(!opts.search, 'TODO support')
    assert(
      opts.patient_id,
      'For now, you must always provide a patient_id as part of a query',
    )
    // if (opts.search) {
    //   qb = qb.where(
    //     'snomed_inferred_canonical_name_and_category.name',
    //     'ilike',
    //     `%${opts.search}%`,
    //   )
    // }
    if (opts.patient_id) {
      qb = qb.where(
        'patient_records.patient_id',
        '=',
        opts.patient_id,
      )
    }
    if (opts.patient_encounter_id) {
      qb = qb.where(
        'patient_records.patient_encounter_id',
        '=',
        opts.patient_encounter_id,
      )
    }
    if (opts.s_expression) {
      qb = qb.where(
        'patient_records.id',
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

    return qb
  },
  insertOneNested,
  insertOneNestedQuery,
})
