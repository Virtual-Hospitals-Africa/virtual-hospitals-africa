import { TrxOrDb } from '../../types.ts'
import { SelectQueryBuilder, sql } from 'kysely'
import {
  ParsedExpression,
  ParsedExpressionNodeType,
  parseExpression,
} from './simple_record_language.ts'
import { nowInvalidRecords } from './patient_records.ts'
import { DB } from '../../db.d.ts'
import { assert } from 'std/assert/assert.ts'
import { CLINICAL_FINDING_SNOMED_CONCEPT_ID } from './warning_signs.ts'
import {
  STATUS_ATTRIBUTE_SNOMED_CONCEPT_ID,
  YES_QUALIFIER_SNOMED_CONCEPT_ID,
} from './patient_findings.ts'

type SatisfyingResult = {
  satisfies: boolean
  record_ids: string[]
}

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
      .select('patient_records.id')

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
      .select('patient_records.id')

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
  not() {
    throw new Error('not is handled by parent nodes')
  },
  // not(trx, patient_id, { expression }) {
  //   return buildExpression(trx, patient_id, expression)
  // },
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
      .select('patient_records.id')
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
  ) => SelectQueryBuilder<DB, 'patient_records', { id: string }>
}

function buildExpression(
  trx: TrxOrDb,
  patient_id: string,
  node: ParsedExpression,
): SelectQueryBuilder<DB, 'patient_records', { id: string }> {
  const builder = EXPRESSION_BUILDERS[node.type]
  // deno-lint-ignore no-explicit-any
  return builder(trx, patient_id, node as any)
}

async function evaluateExpression(
  trx: TrxOrDb,
  patient_id: string,
  node: ParsedExpression,
): Promise<SatisfyingResult> {
  if (node.type === 'not') {
    const any_matching = await buildExpression(trx, patient_id, node.expression)
      .limit(1).executeTakeFirst()
    return {
      record_ids: [],
      satisfies: !any_matching,
    }
  }
  const rows = await buildExpression(trx, patient_id, node).execute()
  return {
    record_ids: rows.map((row) => row.id),
    satisfies: rows.length > 0,
  }
}
