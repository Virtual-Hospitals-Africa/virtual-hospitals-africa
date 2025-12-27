import { IdSelection, Maybe, TrxOrDb } from '../../types.ts'
import { SelectQueryBuilder, sql } from 'kysely'
import { nowInvalidRecords } from './patient_records.ts'
import { DB } from '../../db.d.ts'
import { assert } from 'std/assert/assert.ts'
import {
  CLINICAL_FINDING_SNOMED_CONCEPT_ID,
  STATUS_ATTRIBUTE_SNOMED_CONCEPT_ID,
  YES_QUALIFIER_SNOMED_CONCEPT_ID,
} from './patient_findings.ts'
import isString from '../../util/isString.ts'
import {
  Atom,
  isAtom,
  ParsedExpression,
  ParsedExpressionOf,
  parseExpression,
} from '../../shared/s_expression.ts'
import { deduplicate } from '../helpers.ts'

type PatientIdentifiers = {
  patient_id: string | IdSelection
  patient_encounter_id?: Maybe<string | IdSelection>
  procedure_id?: Maybe<string | IdSelection>
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
  }: PatientIdentifiers & {
    snomed_concept_id?: Maybe<string>
    value_snomed_concept_id?: Maybe<string>
    descendent_of_snomed_concept_id?: Maybe<string>
    qualifiers?: Array<
      | ParsedExpressionOf<'qualifier'>
      | ParsedExpressionOf<'not_qualifier'>
    >
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
    if (qualifier.atom === 'qualifier') {
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
    } else {
      assert(qualifier.atom === 'not_qualifier')
      query = query.where(
        'patient_records.id',
        'not in',
        EXPRESSION_BUILDERS.qualifier(trx, {
          patient_id,
          patient_encounter_id,
        }, {
          atom: 'qualifier',
          snomed_concept_id: qualifier.snomed_concept_id,
          value_snomed_concept_id: null,
          qualifiers: [],
        })
          .clearSelect()
          .select('patient_record_qualifiers.qualifies_record_id'),
      )
    }
  }

  return query
}

export const satisfyingSExpression = deduplicate(
  async function satisfyingSExpression(
    trx: TrxOrDb,
    { s_expression, ...patient }: {
      s_expression: string | ParsedExpression
    } & PatientIdentifiers,
  ): Promise<SatisfyingResult> {
    const node = isString(s_expression)
      ? parseExpression(s_expression)
      : s_expression

    if (isAtom(node, 'not')) {
      const any_matching = await buildExpression(trx, patient, node.expression)
        .limit(1).executeTakeFirst()

      return {
        record_ids: [],
        satisfies: !any_matching,
      }
    }
    const qb = buildExpression(trx, patient, node)
    const rows = await qb.execute()
    return {
      record_ids: rows.map((row) => row.id),
      satisfies: rows.length > 0,
    }
  },
)

function measurement(
  trx: TrxOrDb,
  patient: PatientIdentifiers,
  { snomed_concept_id }: ParsedExpressionOf<'measurement'>,
) {
  return baseQuery(trx, {
    ...patient,
    snomed_concept_id: '118245000',
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
    .where(
      'patient_findings.finding_snomed_concept_id',
      '=',
      snomed_concept_id,
    )
}

const EXPRESSION_BUILDERS = {
  finding(
    trx,
    { patient_id, patient_encounter_id, procedure_id },
    {
      snomed_concept_id,
      value_snomed_concept_id,
      finding_snomed_concept_id,
      qualifiers,
    },
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
      .where(
        'patient_findings.finding_snomed_concept_id',
        '=',
        finding_snomed_concept_id,
      )
      .$if(
        !!procedure_id,
        (qb) => qb.where('patient_findings.procedure_id', '=', procedure_id!),
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
  not(trx, { patient_id, patient_encounter_id }, { expression }) {
    return baseQuery(trx, {
      patient_id,
      patient_encounter_id,
    }).where(
      'patient_records.id',
      'not in',
      buildExpression(
        trx,
        { patient_id, patient_encounter_id },
        expression,
      ),
    )
  },
  not_qualifier() {
    throw new Error('not_qualifier is handled by parent nodes')
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
  active_condition(trx, patient, { snomed_concept_id }) {
    return buildExpression(
      trx,
      patient,
      parseExpression(`
        (or (finding ${CLINICAL_FINDING_SNOMED_CONCEPT_ID} ${snomed_concept_id})
            (finding ${STATUS_ATTRIBUTE_SNOMED_CONCEPT_ID} ${snomed_concept_id} ${YES_QUALIFIER_SNOMED_CONCEPT_ID}))
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
  [T in Atom]: (
    trx: TrxOrDb,
    patient: PatientIdentifiers,
    node: ParsedExpression & { atom: T },
  ) => SelectQueryBuilder<DB, 'patient_records', { id: string }>
}

export function buildExpression(
  trx: TrxOrDb,
  patient: PatientIdentifiers,
  node: ParsedExpression | string,
): SelectQueryBuilder<DB, 'patient_records', { id: string }> {
  if (typeof node === 'string') {
    node = parseExpression(node)
  }
  // deno-lint-ignore ban-types
  const builder = EXPRESSION_BUILDERS[node.atom] as Function
  // deno-lint-ignore no-explicit-any
  return builder(trx, patient, node as any) as SelectQueryBuilder<
    DB,
    'patient_records',
    { id: string }
  >
}
