import { sql } from 'kysely'
import { IdSelection, TrxOrDbOrQueryCreator } from '../../types.ts'
import { literalString, success_true } from '../helpers.ts'
import generateUUID from '../../util/uuid.ts'
import { base } from './_base.ts'
import { patient_evaluations, PatientEvaluationInsert } from './patient_evaluations.ts'

type PatientEvaluationScoreInsert = PatientEvaluationInsert & {
  score: number
}

export function baseQuery(
  trx: TrxOrDbOrQueryCreator,
  opts: PatientEvaluationScoresSearch,
) {
  return patient_evaluations.baseQuery(trx, opts).innerJoin(
    'patient_evaluation_scores',
    'patient_evaluations.id',
    'patient_evaluation_scores.id',
  ).innerJoin(
    'patient_records as evaluates_record',
    'patient_evaluations.evaluates_record_id',
    'evaluates_record.id',
  )
    .select([
      'patient_evaluation_scores.score',
    ])
    .orderBy('patient_records_aggregated.created_at', 'desc')
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
  insertOneNested(
    trx: TrxOrDbOrQueryCreator,
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
  },
  totalTEWSEncounterScore(
    trx: TrxOrDbOrQueryCreator,
    { patient_id, patient_encounter_id }: {
      patient_id: string
      patient_encounter_id: string
    },
  ) {
    // const x = await  baseQuery(trx)
    //       // The total score will be included also, so by joining with the findings we only get the score components
    //       // .innerJoin(
    //       //   'patient_findings',
    //       //   'patient_findings.id',
    //       //   'patient_evaluations.evaluates_record_id',
    //       // )
    //       .where(
    //         'patient_records_aggregated.patient_encounter_id',
    //         '=',
    //         patient_encounter_id,
    //       )
    //       .select(
    //         sql`ROW_NUMBER() OVER (PARTITION BY evaluates_record.specific_snomed_concept_id ORDER BY patient_records_aggregated.created_at DESC)`
    //           .as('rank'),
    //       )
    //       .orderBy('patient_records_aggregated.created_at', 'desc')
    //       .execute()

    // console.log(x)

    return trx.with(
      'ranked',
      (qb) =>
        baseQuery(qb, { patient_id, patient_encounter_id })
          // The total score will be included also, so by joining with the findings we only get the score components
          // .innerJoin(
          //   'patient_findings',
          //   'patient_findings.id',
          //   'patient_evaluations.evaluates_record_id',
          // )
          .select(
            sql`ROW_NUMBER() OVER (PARTITION BY evaluates_record.specific_snomed_concept_id ORDER BY patient_records_aggregated.created_at DESC)`
              .as('rank'),
          )
          .orderBy('patient_records_aggregated.created_at', 'desc'),
    ).selectFrom('ranked')
      .where('ranked.rank', '=', 1)
      .select(sql<number>`sum(ranked.score)::integer`.as('total_score'))
      .executeTakeFirstOrThrow()
  },
})
