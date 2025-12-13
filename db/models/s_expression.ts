import { TrxOrDb } from '../../types.ts'
import { SelectQueryBuilder, sql, SqlBool } from 'kysely'
import {
  ParsedExpression,
  ParsedExpressionNodeType,
  parseExpression,
} from './simple_record_language.ts'
import { nowInvalidRecords } from './patient_records.ts'
import { jsonArrayFrom } from '../helpers.ts'
import { DB } from '../../db.d.ts'
import { assert } from 'std/assert/assert.ts'
import { CLINICAL_FINDING_SNOMED_CONCEPT_ID } from './warning_signs.ts'
import {
  STATUS_ATTRIBUTE_SNOMED_CONCEPT_ID,
  YES_QUALIFIER_SNOMED_CONCEPT_ID,
} from './patient_findings.ts'

type SatisfyingResult = {
  satisfies: SqlBool
  record_ids: string[]
}

/**
 * Evaluates an s_expression against patient findings to determine if the condition is satisfied.
 *
 * Supported expressions:
 * - (finding <snomed_concept_id>) - checks if a finding with this concept exists
 * - (finding <snomed_concept_id> (qualifier <qualifier_snomed_concept_id>)) - checks if a finding with qualifier exists
 * - (not <expression>) - negates the result
 */
export function satisfyingSExpression(
  trx: TrxOrDb,
  { patient_id, s_expression }: {
    patient_id: string
    s_expression: string
  },
): Promise<SatisfyingResult> {
  const parsed = parseExpression(s_expression)
  return evaluateExpression(trx, patient_id, parsed)
}

const EXPRESSION_BUILDERS = {
  finding(trx, patient_id, { snomed_concept_id, qualifiers }) {
    let query = trx.selectFrom('patient_records')
      .innerJoin(
        'patient_findings',
        'patient_records.id',
        'patient_findings.id',
      )
      .where('patient_id', '=', patient_id)
      .where('snomed_concept_id', '=', snomed_concept_id)
      // Top-level findings do not have arbitrary snomed_concept_id codes (I think)
      // .where(eb =>
      //   sql<boolean>`is_descendant(${
      //     eb.ref('patient_records.snomed_concept_id')
      //   }, ${snomed_concept_id}::bigint)`
      // )
      .where(
        'patient_records.id',
        'not in',
        nowInvalidRecords(trx, { patient_id }),
      )
      .select((eb) => [
        jsonArrayFrom(eb.ref('patient_records.id')).as('record_ids'),
        eb.exists('patient_records.id').as('satisfies'),
      ])

    for (const qualifier of qualifiers) {
      if (qualifier.type === 'not') {
        query = query.where(
          'patient_records.id',
          'not in',
          buildExpression(trx, patient_id, qualifier)
            .clearSelect()
            .select('patient_records.id'),
        )
      } else {
        assert(qualifier.type === 'qualifier')
        query = query.where(
          'patient_records.id',
          'in',
          EXPRESSION_BUILDERS.qualifier(trx, patient_id, qualifier)
            .clearSelect()
            .select('patient_record_qualifiers.qualifies_record_id'),
        )
      }
    }

    return query
  },
  qualifier(
    trx,
    patient_id,
    { snomed_concept_id, value_snomed_concept_id, qualifiers },
  ) {
    assert(
      !value_snomed_concept_id,
      'This is more used for insert. Maybe this is a valid use case, but need to think through it',
    )

    let query = trx.selectFrom('patient_records')
      .innerJoin(
        'patient_record_qualifiers',
        'patient_records.id',
        'patient_record_qualifiers.id',
      )
      .where('patient_id', '=', patient_id)
      // When looking for qualifiers I think we're always counting descendants
      .where((eb) =>
        sql<boolean>`is_descendant(${
          eb.ref('patient_records.snomed_concept_id')
        }, ${snomed_concept_id}::bigint)`
      )
      .where(
        'patient_records.id',
        'not in',
        nowInvalidRecords(trx, { patient_id }),
      )
      .select((eb) => [
        jsonArrayFrom(eb.ref('patient_records.id')).as('record_ids'),
        eb.exists('patient_records.id').as('satisfies'),
      ])

    for (const qualifier of qualifiers) {
      if (qualifier.type === 'not') {
        query = query.where(
          'patient_records.id',
          'not in',
          buildExpression(trx, patient_id, qualifier)
            .clearSelect()
            .select('patient_records.id'),
        )
      } else {
        assert(qualifier.type === 'qualifier')
        query = query.where(
          'patient_records.id',
          'in',
          EXPRESSION_BUILDERS.qualifier(trx, patient_id, qualifier)
            .clearSelect()
            .select('patient_record_qualifiers.qualifies_record_id'),
        )
      }
    }

    return query
  },
  not(trx, patient_id, { expression }) {
    return trx.selectFrom('patient_records')
      .where('patient_id', '=', patient_id)
      .where(
        'patient_records.id',
        'not in',
        nowInvalidRecords(trx, { patient_id }),
      )
      .where(
        'patient_records.id',
        'not in',
        buildExpression(trx, patient_id, expression)
          .clearSelect()
          .select('patient_records.id'),
      )
      .select((eb) => [
        sql<string[]>`ARRAY[]::varchar(255)[]`.as('record_ids'),
        eb.exists('patient_records.id').as('satisfies'),
      ])
  },
  or(trx, patient_id, { expressions }) {
    return trx.selectFrom('patient_records')
      .innerJoin(
        'patient_findings',
        'patient_records.id',
        'patient_findings.id',
      )
      .where('patient_id', '=', patient_id)
      .where(
        'patient_records.id',
        'not in',
        nowInvalidRecords(trx, { patient_id }),
      )
      .where(
        (eb) =>
          eb.or(expressions.map((expression) =>
            eb(
              'patient_records.id',
              'in',
              buildExpression(trx, patient_id, expression)
                .clearSelect()
                .select('patient_records.id'),
            )
          )),
      )
      .select((eb) => [
        jsonArrayFrom(eb.ref('patient_records.id')).as('record_ids'),
        eb.exists('patient_records.id').as('satisfies'),
      ])
  },
  active_condition(trx, patient_id, { snomed_concept_id }) {
    return buildExpression(
      trx,
      patient_id,
      parseExpression(`
      (or (finding ${CLINICAL_FINDING_SNOMED_CONCEPT_ID} (qualifier ${snomed_concept_id}))
          (finding ${STATUS_ATTRIBUTE_SNOMED_CONCEPT_ID} ${YES_QUALIFIER_SNOMED_CONCEPT_ID} (qualifier ${snomed_concept_id})))
    `),
    )
  },
} satisfies {
  [T in ParsedExpressionNodeType]: (
    trx: TrxOrDb,
    patient_id: string,
    node: ParsedExpression & { type: T },
  ) => SelectQueryBuilder<DB, 'patient_records', {
    record_ids: string[]
    satisfies: SqlBool
  }>
}

function buildExpression(
  trx: TrxOrDb,
  patient_id: string,
  node: ParsedExpression,
): SelectQueryBuilder<DB, 'patient_records', {
  record_ids: string[]
  satisfies: SqlBool
}> {
  const builder = EXPRESSION_BUILDERS[node.type]
  return builder(trx, patient_id, node as any)
}

function evaluateExpression(
  trx: TrxOrDb,
  patient_id: string,
  node: ParsedExpression,
): Promise<SatisfyingResult> {
  return buildExpression(trx, patient_id, node).executeTakeFirstOrThrow()
}
