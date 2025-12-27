import { sql } from 'kysely'
import { IdSelection, TrxOrDb } from '../../types.ts'
import { literalString, success_true } from '../helpers.ts'
import generateUUID from '../../util/uuid.ts'
import { base } from './_base.ts'
import { assert } from 'std/assert/assert.ts'
import { buildExpression } from './s_expression.ts'
import {
  patient_evaluations,
  PatientEvaluationInsert,
} from './patient_evaluations.ts'

type PatientEvaluationScoreInsert = PatientEvaluationInsert & {
  score: number
}
export function insertOneNested(
  trx: TrxOrDb,
  {
    score,
    evaluation_id = generateUUID(),
    ...to_insert
  }: PatientEvaluationScoreInsert,
) {
  return patient_evaluations.insertOneNestedQuery(trx, {
    evaluation_id,
    ...to_insert,
  }).with(
    'inserting_patient_evaluation_score',
    (qb) =>
      qb.insertInto('patient_evaluation_scores')
        .values({ id: evaluation_id, score }),
  )
    .selectNoFrom([
      success_true,
      sql<true>`true`.as('inserted_new'),
      literalString(evaluation_id).as('evaluation_id'),
    ])
    .executeTakeFirstOrThrow()
}

export function baseQuery(
  trx: TrxOrDb,
) {
  return patient_evaluations.baseQuery(trx).innerJoin(
    'patient_evaluation_scores',
    'patient_evaluations.id',
    'patient_evaluation_scores.id',
  )
    .select([
      'patient_evaluation_scores.score',
    ])
}

type PatientEvaluationScoresSearch = {
  patient_id: string | IdSelection
  patient_encounter_id?: string | IdSelection
  s_expression?: string
  search?: string
}

export const patient_evaluation_scores = base({
  top_level_table: 'patient_evaluation_scores',
  baseQuery,
  formatResult: (x) => x,
  handleSearch(
    qb,
    opts: PatientEvaluationScoresSearch,
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
})
