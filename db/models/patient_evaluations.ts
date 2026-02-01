import { sql } from 'kysely'
import { IdSelection, TrxOrDb, TrxOrDbOrQueryCreator } from '../../types.ts'
import { asText, caseWhenMatching, jsonBuildNullableObject, literalString, success_true } from '../helpers.ts'
import generateUUID from '../../util/uuid.ts'
import { parseExpressionExpectingAtom } from '../../shared/s_expression.ts'
import { patient_records } from './patient_records.ts'
import { base } from './_base.ts'
import { assert } from 'std/assert/assert.ts'
import { buildExpression } from './s_expression.ts'
import isString from '../../util/isString.ts'
import assertHasProperty from '../../util/assertHasProperty.ts'
import { Lang } from '../../shared/s_expression_schemas.ts'
import { formatRecord } from '../../shared/patient_records.ts'
import { SNOMED_CONCEPT_IDS_TO_WORKFLOW_NAMES } from '../../shared/workflow.ts'

export type PatientEvaluationInsert =
  & {
    evaluation_id?: string
    patient_id: string
    patient_encounter_id: string
    evaluation: string | Lang['evaluation']
    evaluates_record_id?: string | null
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
  const evaluation_node = isString(evaluation) ? parseExpressionExpectingAtom(evaluation, 'evaluation') : evaluation
  assertHasProperty(evaluation_node, 'root_snomed_concept')
  assertHasProperty(evaluation_node, 'specific_snomed_concept')

  return patient_records.baseInsert(
    trx,
    {
      patient_id,
      patient_encounter_id,
      record_id: evaluation_id,
      ...evaluation_node,
    },
  ).with(
    'inserting_evaluation',
    (qb) =>
      qb.insertInto('patient_evaluations')
        .values({
          id: evaluation_id,
          employment_id,
          evaluates_record_id,
          by_system: by_system || false,
        }).returning('id'),
  )
}

export function insertOneNested(
  trx: TrxOrDb,
  to_insert: PatientEvaluationInsert,
) {
  return insertOneNestedQuery(trx, to_insert)
    .selectFrom('inserting_evaluation')
    .select([
      success_true,
      sql<true>`true`.as('inserted_new'),
      'inserting_evaluation.id as evaluation_id',
    ])
}

export type PatientEvaluationsSearch = {
  patient_id?: string | IdSelection
  root_snomed_concept_id?: string
  specific_snomed_concept_id?: string
  patient_encounter_id?: string | IdSelection
  evaluates_record_id?: string | IdSelection
  s_expression?: string | Lang['evaluation']
}

export function baseQuery(
  trx: TrxOrDbOrQueryCreator,
  opts: PatientEvaluationsSearch,
) {
  let qb = patient_records.baseQuery(trx).innerJoin(
    'patient_evaluations',
    'patient_evaluations.id',
    'patient_records_aggregated.id',
  )
    .leftJoin(
      'patient_records_aggregated as procedures_aggregated',
      'patient_evaluations.procedure_id',
      'procedures_aggregated.id',
    )
    .select((eb) => [
      literalString('evaluation').$castTo<'evaluation'>().as('type'),
      'patient_evaluations.employment_id',
      'patient_evaluations.by_system',
      'patient_evaluations.evaluates_record_id',
      jsonBuildNullableObject(
        eb.ref('procedures_aggregated.id'),
        {
          id: eb.ref('procedures_aggregated.id').$notNull(),
          root_snomed_concept_id: asText(eb, 'procedures_aggregated.root_snomed_concept_id').$notNull(),
          root_snomed_concept_name: eb.ref('procedures_aggregated.root_snomed_concept_name').$notNull(),
          root_snomed_concept_category: eb.ref('procedures_aggregated.root_snomed_concept_category').$notNull(),
          specific_snomed_concept_id: asText(
            eb,
            'procedures_aggregated.specific_snomed_concept_id',
          ).$notNull(),
          specific_snomed_concept_name: eb.ref('procedures_aggregated.specific_snomed_concept_name').$notNull(),
          specific_snomed_concept_category: eb.ref('procedures_aggregated.specific_snomed_concept_category').$notNull(),
          workflow_step_name: caseWhenMatching(eb, eb.ref('procedures_aggregated.specific_snomed_concept_id').$notNull(), SNOMED_CONCEPT_IDS_TO_WORKFLOW_NAMES),
        },
      ).as('as_part_of_procedure'),
    ])

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
  if (opts.root_snomed_concept_id) {
    qb = qb.where(
      'patient_records_aggregated.root_snomed_concept_id',
      '=',
      opts.root_snomed_concept_id,
    )
  }
  if (opts.specific_snomed_concept_id) {
    qb = qb.where(
      'patient_records_aggregated.specific_snomed_concept_id',
      '=',
      opts.specific_snomed_concept_id,
    )
  }
  if (opts.evaluates_record_id) {
    qb = qb.where(
      'patient_evaluations.evaluates_record_id',
      '=',
      opts.evaluates_record_id,
    )
  }
  if (opts.s_expression) {
    assert(
      opts.patient_id,
      'For now, you must always provide a patient_id as part of a query',
    )
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

  return qb
}

export const patient_evaluations = base({
  top_level_table: 'patient_evaluations',
  baseQuery,
  formatResult: formatRecord,
  insertOneNested,
  insertOneNestedQuery,
})
