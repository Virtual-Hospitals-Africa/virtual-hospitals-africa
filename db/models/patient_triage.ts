import { sql } from 'kysely'
import { TRIAGE_PROCEDURE_SNOMED_CONCEPT_ID } from '../../shared/patient_triage.ts'
import { IdSelection, TrxOrDb, TrxOrDbOrQueryCreator } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { success_true } from '../helpers.ts'
import {
  PRIORITY_SNOMED_CODES,
  PRIORITY_SNOMED_CONCEPT_ID,
  TARGET_TIME_TO_TREATMENT_MINUTES,
  TriageLevel,
} from '../../shared/priorities.ts'
import assert from 'assert'
import { base } from './_base.ts'
import { patient_evaluations } from './patient_evaluations.ts'
import { buildExpression } from './s_expression.ts'

export const NATIONAL_EARLY_WARNING_SCORE_SNOMED_CONCEPT_ID = '1287358002' // |National Early Warning Score (assessment scale)|
export const SOUTH_AFRICA_SNOMED_CONCEPT_ID = '223549008' // |South Africa (geographic location)|

export function insertProcedure(
  trx: TrxOrDb,
  {
    patient_id,
    patient_encounter_id,
    employment_id,
  }: {
    patient_id: string
    patient_encounter_id: string
    employment_id: string
  },
) {
  const triage_procedure_id = generateUUID()

  return trx.with(
    'inserting_record',
    (qb) =>
      qb.insertInto('patient_records')
        .values({
          id: triage_procedure_id,
          patient_id,
          patient_encounter_id,
          snomed_concept_id: TRIAGE_PROCEDURE_SNOMED_CONCEPT_ID,
        }),
  ).with('inserting_procedure', (qb) =>
    qb.insertInto('patient_procedures')
      .values({
        id: triage_procedure_id,
        employment_id,
        by_system: false,
      })
      .returning('id'))
    .selectFrom('inserting_procedure')
    .select([
      'id as triage_procedure_id',
      success_true,
    ])
    .executeTakeFirstOrThrow()
}

export function insertLevel(
  trx: TrxOrDb,
  {
    patient_id,
    patient_encounter_id,
    employment_id,
    by_system = false,
    procedure_id,
    evaluates_record_id,
    triage_level,
  }: {
    patient_id: string
    patient_encounter_id: string
    employment_id?: string
    by_system?: boolean
    procedure_id: string
    evaluates_record_id: string
    triage_level: TriageLevel
  },
) {
  const triage_level_evaluation_id = generateUUID()
  const value_snomed_concept_id = PRIORITY_SNOMED_CODES[triage_level]
  const target_treatment_minutes =
    TARGET_TIME_TO_TREATMENT_MINUTES[triage_level]

  return trx.with(
    'inserting_evaluation_records',
    (qb) =>
      qb.insertInto('patient_records')
        .values({
          id: triage_level_evaluation_id,
          patient_id,
          patient_encounter_id,
          snomed_concept_id: PRIORITY_SNOMED_CONCEPT_ID,
          value_snomed_concept_id,
        }),
  ).with('inserting_evaluations', (qb) =>
    qb.insertInto('patient_evaluations')
      .values({
        id: triage_level_evaluation_id,
        evaluates_record_id,
        employment_id,
        by_system,
        procedure_id,
      })
      .returning('id'))
    .with(
      'inserting_triage_level',
      (qb) =>
        qb.insertInto('patient_triage_level')
          .values({
            id: triage_level_evaluation_id,
            target_treatment_time: sql`now() + interval '${
              sql.raw(target_treatment_minutes.toString())
            } minutes'`,
          })
          .returningAll(),
    )
    .selectFrom('inserting_triage_level')
    .selectAll('inserting_triage_level')
    .select([
      success_true,
    ])
    .executeTakeFirstOrThrow()
}


export function baseQuery(
  trx: TrxOrDbOrQueryCreator,
) {
  return patient_evaluations.baseQuery(trx).innerJoin(
    'patient_triage_level',
    'patient_evaluations.id',
    'patient_triage_level.id',
  )
    .select([
      'patient_triage_level.target_treatment_time',
    ])
}

type PatientEvaluationTriageSearch = {
  patient_id: string | IdSelection
  patient_encounter_id?: string | IdSelection
  s_expression?: string
  search?: string
}

export const patient_triage_level = base({
  top_level_table: 'patient_triage_level',
  baseQuery,
  formatResult: (x) => x,
  handleSearch(
    qb,
    opts: PatientEvaluationTriageSearch,
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
})
