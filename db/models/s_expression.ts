import { Maybe, TrxOrDb } from '../../types.ts'
import { SelectQueryBuilder, sql } from 'kysely'
import {
  ParsedExpression,
  ParsedExpressionNodeType,
  ParsedQualifierOrNotExpression,
  parseExpression,
  parseQualifierExpression,
} from '../../shared/s_expression.ts'
import { nowInvalidRecords } from './patient_records.ts'
import { DB } from '../../db.d.ts'
import { assert } from 'std/assert/assert.ts'
import {
  CLINICAL_FINDING_SNOMED_CONCEPT_ID,
  STATUS_ATTRIBUTE_SNOMED_CONCEPT_ID,
  YES_QUALIFIER_SNOMED_CONCEPT_ID,
} from './patient_findings.ts'
import isString from '../../util/isString.ts'

type PatientIdentifiers = {
  patient_id: string
  patient_encounter_id?: Maybe<string>
}
type SatisfyingResult = {
  satisfies: boolean
  record_ids: string[]
}

function baseQuery(
  trx: TrxOrDb,
  {
    patient_id,
    patient_encounter_id,
    snomed_concept_id,
    value_snomed_concept_id,
    descendent_of_snomed_concept_id,
    qualifiers = [],
  }: {
    patient_id: string
    patient_encounter_id?: Maybe<string>
    snomed_concept_id?: Maybe<string>
    value_snomed_concept_id?: Maybe<string>
    descendent_of_snomed_concept_id?: Maybe<string>
    qualifiers?: ParsedQualifierOrNotExpression[]
  },
) {
  let query = trx.selectFrom('patient_records')
    .where('patient_id', '=', patient_id)
    .where(
      'patient_records.id',
      'not in',
      nowInvalidRecords(trx, { patient_id }),
    )
    .$if(
      !!patient_encounter_id,
      (qb) => qb.where('patient_encounter_id', '=', patient_encounter_id!),
    )
    .$if(
      !!snomed_concept_id,
      (qb) =>
        qb.where('patient_records.snomed_concept_id', '=', snomed_concept_id!),
    )
    .$if(
      !!value_snomed_concept_id,
      (qb) =>
        qb.where(
          'patient_records.value_snomed_concept_id',
          '=',
          value_snomed_concept_id!,
        ),
    )
    .$if(
      !!descendent_of_snomed_concept_id,
      (qb) =>
        qb.where((eb) =>
          sql<boolean>`is_descendant(${
            eb.ref('patient_records.snomed_concept_id')
          }, ${descendent_of_snomed_concept_id!}::bigint)`
        ),
    )
    .select('patient_records.id')

  for (const qualifier of qualifiers) {
    if (qualifier.type === 'not') {
      assert(qualifier.expression.type === 'qualifier')
      query = query.where(
        'patient_records.id',
        'not in',
        EXPRESSION_BUILDERS.qualifier(trx, {
          patient_id,
          patient_encounter_id,
        }, qualifier.expression)
          .clearSelect()
          .select('patient_record_qualifiers.qualifies_record_id'),
      )
    } else {
      assert(qualifier.type === 'qualifier')
      query = query.where(
        'patient_records.id',
        'in',
        EXPRESSION_BUILDERS.qualifier(trx, {
          patient_id,
          patient_encounter_id,
        }, qualifier)
          .clearSelect()
          .select('patient_record_qualifiers.qualifies_record_id'),
      )
    }
  }

  return query
}

export async function satisfyingSExpression(
  trx: TrxOrDb,
  { s_expression, ...patient }: {
    s_expression: string | ParsedExpression
    patient_id: string
    patient_encounter_id?: Maybe<string>
  },
): Promise<SatisfyingResult> {
  const node = isString(s_expression)
    ? parseExpression(s_expression)
    : s_expression
  if (node.type === 'not') {
    const any_matching = await buildExpression(trx, patient, node.expression)
      .limit(1).executeTakeFirst()

    return {
      record_ids: [],
      satisfies: !any_matching,
    }
  }
  const rows = await buildExpression(trx, patient, node).execute()
  return {
    record_ids: rows.map((row) => row.id),
    satisfies: rows.length > 0,
  }
}

function measurement(
  trx: TrxOrDb,
  patient: PatientIdentifiers,
  { snomed_concept_id }: ParsedExpression & { type: 'measurement' },
) {
  return baseQuery(trx, {
    ...patient,
    snomed_concept_id: '118245000',
    qualifiers: [
      parseQualifierExpression(`(qualifier ${snomed_concept_id})`),
    ],
  })
    .innerJoin(
      'patient_findings',
      'patient_records.id',
      'patient_findings.id',
    )
    .innerJoin(
      'patient_measurements',
      'patient_records.id',
      'patient_measurements.id',
    )
}

const EXPRESSION_BUILDERS = {
  finding(
    trx,
    { patient_id, patient_encounter_id },
    { snomed_concept_id, value_snomed_concept_id, qualifiers },
  ) {
    return baseQuery(trx, {
      patient_id,
      patient_encounter_id,
      snomed_concept_id,
      value_snomed_concept_id,
      qualifiers,
    })
      .innerJoin(
        'patient_findings',
        'patient_records.id',
        'patient_findings.id',
      )
  },
  procedure(
    trx,
    { patient_id, patient_encounter_id },
    { snomed_concept_id, value_snomed_concept_id, qualifiers },
  ) {
    return baseQuery(trx, {
      patient_id,
      patient_encounter_id,
      snomed_concept_id,
      value_snomed_concept_id,
      qualifiers,
    })
      .innerJoin(
        'patient_procedures',
        'patient_records.id',
        'patient_procedures.id',
      )
  },
  evaluation(
    trx,
    { patient_id, patient_encounter_id },
    { snomed_concept_id, value_snomed_concept_id, /*, evaluates*/ qualifiers },
  ) {
    return baseQuery(trx, {
      patient_id,
      patient_encounter_id,
      snomed_concept_id,
      value_snomed_concept_id,
      qualifiers,
    })
      .innerJoin(
        'patient_evaluations',
        'patient_records.id',
        'patient_evaluations.id',
      )
    // .where(
    //   'evaluates_record_id',
    //   'in',
    //   buildExpression(
    //     trx,
    //     { patient_id, patient_encounter_id },
    //     evaluates.expression,
    //   ),
    // )
  },
  qualifier(
    trx,
    { patient_id, patient_encounter_id },
    { snomed_concept_id, value_snomed_concept_id, qualifiers },
  ) {
    return baseQuery(trx, {
      patient_id,
      patient_encounter_id,
      value_snomed_concept_id,
      qualifiers,
      descendent_of_snomed_concept_id: snomed_concept_id,
    })
      .innerJoin(
        'patient_record_qualifiers',
        'patient_records.id',
        'patient_record_qualifiers.id',
      )
  },
  not() {
    throw new Error('not is handled by parent nodes')
  },
  // evaluates() {
  //   throw new Error('evalutes is handled by parent nodes')
  // },
  task() {
    throw new Error('task is not directly queryable')
  },
  or(trx, { patient_id, patient_encounter_id }, { expressions }) {
    return baseQuery(trx, { patient_id, patient_encounter_id })
      .where(
        (eb) =>
          eb.or(expressions.map((expression) =>
            eb(
              'patient_records.id',
              'in',
              buildExpression(
                trx,
                { patient_id, patient_encounter_id },
                expression,
              ),
            )
          )),
      )
  },
  and(trx, { patient_id, patient_encounter_id }, { expressions }) {
    return baseQuery(trx, { patient_id, patient_encounter_id })
      .where(
        (eb) =>
          eb.and(expressions.map((expression) =>
            eb(
              'patient_records.id',
              'in',
              buildExpression(
                trx,
                { patient_id, patient_encounter_id },
                expression,
              ),
            )
          )),
      )
  },
  measurement,
  units() {
    throw new Error('units is handled by parent nodes')
  },
  active_condition(trx, patient, { snomed_concept_id }) {
    return buildExpression(
      trx,
      patient,
      parseExpression(`
        (or (finding ${CLINICAL_FINDING_SNOMED_CONCEPT_ID} (qualifier ${snomed_concept_id}))
            (finding ${STATUS_ATTRIBUTE_SNOMED_CONCEPT_ID} ${YES_QUALIFIER_SNOMED_CONCEPT_ID} (qualifier ${snomed_concept_id})))
      `),
    )
  },
  '>'(trx, patient, { left, right }) {
    return measurement(trx, patient, left)
      .where('patient_measurements.units', '=', right.units)
      .where('patient_measurements.value', '>', String(right.value))
  },
  '<'(trx, patient, { left, right }) {
    return measurement(trx, patient, left)
      .where('patient_measurements.units', '=', right.units)
      .where('patient_measurements.value', '<', String(right.value))
  },
  '>='(trx, patient, { left, right }) {
    return measurement(trx, patient, left)
      .where('patient_measurements.units', '=', right.units)
      .where('patient_measurements.value', '>=', String(right.value))
  },
  '<='(trx, patient, { left, right }) {
    return measurement(trx, patient, left)
      .where('patient_measurements.units', '=', right.units)
      .where('patient_measurements.value', '<=', String(right.value))
  },
  '='(trx, patient, { left, right }) {
    return measurement(trx, patient, left)
      .where('patient_measurements.units', '=', right.units)
      .where('patient_measurements.value', '=', String(right.value))
  },
} satisfies {
  [T in ParsedExpressionNodeType]: (
    trx: TrxOrDb,
    patient: PatientIdentifiers,
    node: ParsedExpression & { type: T },
  ) => SelectQueryBuilder<DB, 'patient_records', { id: string }>
}

export function buildExpression(
  trx: TrxOrDb,
  patient: PatientIdentifiers,
  node: ParsedExpression,
): SelectQueryBuilder<DB, 'patient_records', { id: string }> {
  // deno-lint-ignore ban-types
  const builder = EXPRESSION_BUILDERS[node.type] as Function
  // deno-lint-ignore no-explicit-any
  return builder(trx, patient, node as any) as SelectQueryBuilder<
    DB,
    'patient_records',
    { id: string }
  >
}
