import { IdSelection, Maybe, TrxOrDb } from '../../types.ts'
import { SelectQueryBuilder, sql } from 'kysely'
import { nowInvalidRecords } from './patient_records.ts'
import { DB } from '../../db.d.ts'
import { assert } from 'std/assert/assert.ts'
import {
  ATTRIBUTE_SNOMED_CONCEPT_ID,
  CLINICAL_FINDING_SNOMED_CONCEPT_ID,
  STATUS_ATTRIBUTE_SNOMED_CONCEPT_ID,
  YES_QUALIFIER_SNOMED_CONCEPT_ID,
} from './patient_findings.ts'
import isString from '../../util/isString.ts'
import { Atom, isAtom, parseExpression } from '../../shared/s_expression.ts'
import { deduplicate } from '../helpers.ts'
import { AnyNode, Lang } from '../../shared/s_expression_schemas.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'

type PatientIdentifiers = {
  patient_id: string | IdSelection
  patient_encounter_id?: Maybe<string | IdSelection>
  procedure_id?: Maybe<string | IdSelection>
}
type SatisfyingResult = {
  satisfies: boolean
  record_ids: string[]
}

export function snomedConceptBase(
  trx: TrxOrDb,
  snomed_concept: Lang['snomed_concept'],
) {
  assert(isAtom(snomed_concept, 'snomed_concept'))
  if (snomed_concept.type === 'id') return snomed_concept.id

  return trx
    .selectFrom('snomed_inferred_canonical_name_and_category')
    .where('name', '=', snomed_concept.name)
    .where('category', '=', snomed_concept.category)
    .select('id')
}

export function maybeSnomedConceptBase(
  trx: TrxOrDb,
  snomed_concept: Lang['snomed_concept'] | null,
) {
  return snomed_concept && snomedConceptBase(trx, snomed_concept)
}

function baseQuery(
  trx: TrxOrDb,
  {
    patient_id,
    patient_encounter_id,
    snomed_concept,
    value_snomed_concept,
    qualifiers = [],
    attributes = [],
  }: PatientIdentifiers & {
    snomed_concept?: Maybe<Lang['snomed_concept']>
    value_snomed_concept?: Maybe<Lang['snomed_concept']>
    qualifiers?: Array<
      Lang['qualifier']
    >
    attributes?: Array<
      Lang['attribute']
    >
  },
) {
  let query = trx.selectFrom('patient_records')
    .where('patient_id', '=', patient_id)
    .where(
      'patient_records.id',
      'not in',
      nowInvalidRecords(trx),
    )
    .$if(
      !!patient_encounter_id,
      (qb) => qb.where('patient_encounter_id', '=', patient_encounter_id!),
    )
    .$if(
      !!snomed_concept,
      (qb) =>
        qb.where(
          'patient_records.snomed_concept_id',
          '=',
          snomedConceptBase(trx, snomed_concept!),
        ),
    )
    .$if(
      !!value_snomed_concept,
      (qb) =>
        qb.where((eb) =>
          eb.and([
            eb('patient_records.value_snomed_concept_id', 'is not', null),
            sql<boolean>`is_descendant(${
              eb.ref('patient_records.value_snomed_concept_id')
            }, ${snomedConceptBase(trx, value_snomed_concept!)}::bigint)`,
          ])
        ),
    )
    .select('patient_records.id')

  for (const qualifier of qualifiers) {
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

  for (const attribute of attributes) {
    query = query.where(
      'patient_records.id',
      'in',
      EXPRESSION_BUILDERS.attribute(trx, {
        patient_id,
        patient_encounter_id,
      }, attribute)
        .clearSelect()
        .select('patient_record_qualifiers.qualifies_record_id'),
    )
  }

  return query
}

export const satisfyingSExpression = deduplicate(
  async function satisfyingSExpression(
    trx: TrxOrDb,
    { s_expression, ...patient }: {
      s_expression: string | AnyNode
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
  { snomed_concept }: Lang['measurement'],
) {
  return baseQuery(trx, {
    ...patient,
    snomed_concept: {
      atom: 'snomed_concept',
      type: 'id',
      id: '118245000',
    },
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
      snomedConceptBase(trx, snomed_concept),
    )
}

const EXPRESSION_BUILDERS = {
  finding(
    trx,
    { patient_id, patient_encounter_id, procedure_id },
    {
      snomed_concept,
      value_snomed_concept,
      finding_snomed_concept,
      qualifiers,
      attributes,
    },
  ) {
    return baseQuery(trx, {
      patient_id,
      patient_encounter_id,
      snomed_concept,
      value_snomed_concept,
      qualifiers,
      attributes,
    })
      .innerJoin(
        'patient_findings',
        'patient_records.id',
        'patient_findings.id',
      )
      .$if(
        !!finding_snomed_concept,
        (qb) =>
          qb.where((eb) =>
            sql<boolean>`is_descendant(${
              eb.ref('patient_findings.finding_snomed_concept_id')
            }, ${snomedConceptBase(trx, finding_snomed_concept!)}::bigint)`
          ),
      )
      .$if(
        !!procedure_id,
        (qb) => qb.where('patient_findings.procedure_id', '=', procedure_id!),
      )
  },
  procedure(
    trx,
    { patient_id, patient_encounter_id },
    { snomed_concept, value_snomed_concept, qualifiers /* attributes */ },
  ) {
    return baseQuery(trx, {
      patient_id,
      patient_encounter_id,
      snomed_concept,
      value_snomed_concept,
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
    {
      snomed_concept,
      value_snomed_concept,
      evaluates,
      qualifiers,
      /* attributes */
    },
  ) {
    return baseQuery(trx, {
      patient_id,
      patient_encounter_id,
      snomed_concept,
      value_snomed_concept,
      qualifiers,
    })
      .innerJoin(
        'patient_evaluations',
        'patient_records.id',
        'patient_evaluations.id',
      )
      .$if(!!evaluates, (qb) =>
        qb.where(
          'patient_evaluations.evaluates_record_id',
          'in',
          buildExpression(
            trx,
            { patient_id, patient_encounter_id },
            evaluates!.expression,
          ),
        ))
  },
  qualifier(
    trx,
    { patient_id, patient_encounter_id },
    { snomed_concept, value_snomed_concept, qualifiers },
  ) {
    return baseQuery(trx, {
      patient_id,
      patient_encounter_id,
      snomed_concept,
      value_snomed_concept,
      qualifiers,
    })
      .innerJoin(
        'patient_record_qualifiers',
        'patient_records.id',
        'patient_record_qualifiers.id',
      )
  },
  attribute(
    trx,
    { patient_id, patient_encounter_id },
    { finding_snomed_concept, value },
  ) {
    // Only snomed_concept values are queryable
    const value_snomed_concept = value.atom === 'snomed_concept' ? value : null
    return baseQuery(trx, {
      patient_id,
      patient_encounter_id,
      value_snomed_concept,
      snomed_concept: {
        atom: 'snomed_concept',
        type: 'id',
        id: ATTRIBUTE_SNOMED_CONCEPT_ID,
      },
    })
      .innerJoin(
        'patient_findings',
        'patient_records.id',
        'patient_findings.id',
      )
      .innerJoin(
        'patient_record_qualifiers',
        'patient_records.id',
        'patient_record_qualifiers.id',
      ).where((eb) =>
        sql<boolean>`is_descendant(${
          eb.ref('patient_findings.finding_snomed_concept_id')
        }, ${snomedConceptBase(trx, finding_snomed_concept!)}::bigint)`
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
  active_condition(trx, patient, { snomed_concept }) {
    const snomed_concept_s_expression = inverseSExpression(snomed_concept)
    return buildExpression(
      trx,
      patient,
      parseExpression(`
        (or (finding ${CLINICAL_FINDING_SNOMED_CONCEPT_ID} ${snomed_concept_s_expression})
            (finding ${STATUS_ATTRIBUTE_SNOMED_CONCEPT_ID} ${snomed_concept_s_expression} ${YES_QUALIFIER_SNOMED_CONCEPT_ID}))
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
  evaluates() {
    throw new Error('evalutes is not directly queryable')
  },
  task() {
    throw new Error('task is not directly queryable')
  },
  units() {
    throw new Error('units is not directly queryable')
  },
  snomed_concept() {
    throw new Error('snomed_concept is not directly queryable')
  },
  event() {
    throw new Error('event is not directly queryable')
  },
} satisfies {
  [T in Atom]: (
    trx: TrxOrDb,
    patient: PatientIdentifiers,
    node: AnyNode & { atom: T },
  ) => SelectQueryBuilder<DB, 'patient_records', { id: string }>
}

export function buildExpression(
  trx: TrxOrDb,
  patient: PatientIdentifiers,
  node: AnyNode | string,
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
