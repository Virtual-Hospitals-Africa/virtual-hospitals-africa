import { IdSelection, Maybe, TrxOrDbOrQueryCreator } from '../../types.ts'
import { SelectQueryBuilder, sql } from 'kysely'
import { nowInvalidRecords } from './patient_records_base.ts'
import { DB } from '../../db.d.ts'
import { assert } from 'std/assert/assert.ts'
import isString from '../../util/isString.ts'
import { Atom, isAtom, parseExpression } from '../../shared/s_expression.ts'
import { deduplicate } from '../helpers.ts'
import { AnyNode, Lang } from '../../shared/s_expression_schemas.ts'
import { inverseSExpression } from '../../shared/s_expression_inverse.ts'
import {
  ATTRIBUTE,
  EVENT,
  MEASUREMENT_FINDING,
  NO_QUALIFIER,
  QUALIFIER_VALUE,
  STATUS_ATTRIBUTE,
  UNKNOWN_QUALIFIER,
  YES_QUALIFIER,
} from '../../shared/snomed_concepts.ts'
import isKeyOf from '../../util/isKeyOf.ts'

type PatientIdentifiers = {
  patient_id: string | IdSelection
  patient_encounter_id?: Maybe<string | IdSelection>
  procedure_id?: Maybe<string | IdSelection>
}
type SatisfyingResult = {
  satisfies: boolean
  record_ids: string[]
}

export function nameAndCategorySnomedConceptBase(
  trx: TrxOrDbOrQueryCreator,
  snomed_concept: Lang['snomed_concept'],
) {
  return trx
    .selectFrom('snomed_inferred_canonical_name_and_category')
    .where('name', '=', snomed_concept.name)
    .where('category', '=', snomed_concept.category)
    .select('id')
}

export function snomedConceptBase(
  trx: TrxOrDbOrQueryCreator,
  snomed_concept: Lang['snomed_concept'],
) {
  assert(isAtom(snomed_concept, 'snomed_concept'))
  return nameAndCategorySnomedConceptBase(trx, snomed_concept)
}

export function maybeSnomedConceptBase(
  trx: TrxOrDbOrQueryCreator,
  snomed_concept: Lang['snomed_concept'] | null,
) {
  return snomed_concept && snomedConceptBase(trx, snomed_concept)
}

function baseQuery(
  trx: TrxOrDbOrQueryCreator,
  {
    patient_id,
    patient_encounter_id,
    root_snomed_concept,
    specific_snomed_concept,
    value_snomed_concept,
    qualifiers = [],
    attributes = [],
    exact = false,
    include_negative = false,
  }: PatientIdentifiers & {
    root_snomed_concept?: Maybe<Lang['snomed_concept']>
    specific_snomed_concept?: Maybe<Lang['snomed_concept']>
    value_snomed_concept?: Maybe<Lang['snomed_concept']>
    qualifiers?: Array<
      Lang['qualifier']
    >
    attributes?: Array<
      Lang['attribute']
    >
    exact?: boolean
    include_negative?: boolean
  },
) {
  const query = trx.selectFrom('patient_records')
    .where('patient_records.patient_id', '=', patient_id)
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
      !!root_snomed_concept,
      (qb) =>
        qb.where(
          'patient_records.root_snomed_concept_id',
          '=',
          snomedConceptBase(trx, root_snomed_concept!),
        ),
    )
    .$if(
      !!specific_snomed_concept,
      (qb) =>
        qb.where((eb) => {
          const snomed_concept = snomedConceptBase(
            trx,
            specific_snomed_concept!,
          )
          return exact
            ? eb(
              'patient_records.specific_snomed_concept_id',
              '=',
              snomed_concept,
            )
            : sql<boolean>`is_descendant(${eb.ref('patient_records.specific_snomed_concept_id')}, ${snomed_concept}::bigint)`
        }),
    )
    .$if(
      !!value_snomed_concept,
      (qb) =>
        qb.where((eb) => {
          const snomed_concept = snomedConceptBase(trx, value_snomed_concept!)
          const matches = exact
            ? eb('patient_records.value_snomed_concept_id', '=', snomed_concept)
            : sql<boolean>`is_descendant(${eb.ref('patient_records.value_snomed_concept_id')}, ${snomed_concept}::bigint)`

          return eb.and([
            eb('patient_records.value_snomed_concept_id', 'is not', null),
            matches,
          ])
        }),
    )
    // TODO there's other types of negation in SNOMED, but we're not using them?
    // A more general approach use Finding context: Known absent
    .$if(
      !include_negative,
      (qb) =>
        qb.where((eb) =>
          eb.or([
            eb('patient_records.value_snomed_concept_id', 'is', null),
            eb.and([
              eb(
                'patient_records.value_snomed_concept_id',
                '!=',
                NO_QUALIFIER.id,
              ),
              eb(
                'patient_records.value_snomed_concept_id',
                '!=',
                UNKNOWN_QUALIFIER.id,
              ),
            ]),
          ])
        ),
    )
    .select('patient_records.id')

  const with_qualifiers: typeof query = qualifiers.reduce((qb, qualifier) => (
    qb.where(
      'patient_records.id',
      'in',
      EXPRESSION_BUILDERS.qualifier(trx, {
        patient_id,
        patient_encounter_id,
      }, qualifier)
        .clearSelect()
        .select('patient_record_qualifiers.qualifies_record_id'),
    )
  ), query)

  return attributes.reduce((qb, attribute): typeof query => {
    const attribute_query = EXPRESSION_BUILDERS.attribute(trx, {
      patient_id,
      patient_encounter_id,
    }, attribute)
      .clearSelect()
      .select('patient_record_qualifiers.qualifies_record_id')

    const { value } = attribute

    if (value.atom === 'event') {
      return qb.where(
        'patient_records.id',
        'in',
        attribute_query,
      )
    }

    return qb.where((eb) =>
      eb.or([
        eb('patient_records.id', 'in', attribute_query),
        eb.exists(
          trx.selectFrom('snomed_relationship')
            .where('snomed_relationship.active', '=', true)
            .where(
              'snomed_relationship.type_id',
              '=',
              snomedConceptBase(trx, attribute.specific_snomed_concept),
            )
            .where(
              'snomed_relationship.source_id',
              '=',
              eb.ref('patient_records.specific_snomed_concept_id'),
            )
            .where(
              sql<
                boolean
              >`is_descendant(snomed_relationship.destination_id, ${snomedConceptBase(trx, value)}::bigint)`,
            ),
        ),
      ])
    )
  }, with_qualifiers)
}

export const satisfyingSExpression = deduplicate(
  async function satisfyingSExpression(
    trx: TrxOrDbOrQueryCreator,
    { s_expression, ...patient }: {
      s_expression: string | AnyNode
    } & PatientIdentifiers,
  ): Promise<SatisfyingResult> {
    const node = isString(s_expression) ? parseExpression(s_expression) : s_expression

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
  trx: TrxOrDbOrQueryCreator,
  patient: PatientIdentifiers,
  { snomed_concept, units }: Lang['measurement'],
) {
  return baseQuery(trx, {
    ...patient,
    root_snomed_concept: {
      atom: 'snomed_concept',
      name: MEASUREMENT_FINDING.name,
      category: MEASUREMENT_FINDING.category,
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
      'patient_records.specific_snomed_concept_id',
      '=',
      snomedConceptBase(trx, snomed_concept),
    )
    .where('patient_measurements.units', '=', units)
}

export const EXPRESSION_BUILDERS = {
  finding(
    trx,
    { patient_id, patient_encounter_id, procedure_id },
    {
      root_snomed_concept,
      value_snomed_concept,
      specific_snomed_concept,
      qualifiers,
      attributes,
      exact,
      history,
    },
  ) {
    return baseQuery(trx, {
      patient_id,
      root_snomed_concept,
      specific_snomed_concept,
      value_snomed_concept,
      qualifiers,
      attributes,
      exact,
      // For historical findings, look for findings at any point in the patient's history
      patient_encounter_id: history ? null : patient_encounter_id,
    })
      .innerJoin(
        'patient_findings',
        'patient_records.id',
        'patient_findings.id',
      )
      .$if(
        !!procedure_id,
        (qb) => qb.where('patient_findings.procedure_id', '=', procedure_id!),
      )
  },
  procedure(
    trx,
    { patient_id, patient_encounter_id },
    {
      // root_snomed_concept,
      specific_snomed_concept,
      // value_snomed_concept,
      qualifiers, /* attributes */
      value,
    },
  ) {
    return baseQuery(trx, {
      patient_id,
      patient_encounter_id,
      // root_snomed_concept,
      specific_snomed_concept,
      qualifiers,
    })
      .innerJoin(
        'patient_procedures',
        'patient_records.id',
        'patient_procedures.id',
      )
      .$if(
        !!value?.atom && value?.atom !== 'link',
        (qb) =>
          qb.innerJoin(
            'patient_record_s_expressions',
            'patient_record_s_expressions.id',
            'patient_records.id',
          )
            .where(
              'patient_record_s_expressions.s_expression',
              '=',
              inverseSExpression(value!),
            ),
      )
      .$if(
        value?.atom === 'link',
        (qb) =>
          qb.innerJoin(
            'patient_record_links',
            'patient_record_links.id',
            'patient_records.id',
          )
            .where(
              'patient_record_links.href',
              '=',
              (value as Lang['link']).href,
            ),
      )
  },
  evaluation(
    trx,
    { patient_id, patient_encounter_id },
    {
      root_snomed_concept,
      specific_snomed_concept,
      value_snomed_concept,
      evaluates,
      qualifiers,
      /* attributes */
    },
  ) {
    return baseQuery(trx, {
      patient_id,
      patient_encounter_id,
      root_snomed_concept,
      specific_snomed_concept,
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
    { specific_snomed_concept, qualifiers },
  ) {
    return baseQuery(trx, {
      patient_id,
      patient_encounter_id,
      root_snomed_concept: {
        atom: 'snomed_concept',
        name: QUALIFIER_VALUE.name,
        category: QUALIFIER_VALUE.category,
      },
      specific_snomed_concept,
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
    { specific_snomed_concept, value },
  ) {
    const matches_attr = baseQuery(trx, {
      patient_id,
      patient_encounter_id,
      specific_snomed_concept,
      value_snomed_concept: value.atom === 'event' ? undefined : value,
      root_snomed_concept: {
        atom: 'snomed_concept',
        ...(
          value.atom === 'event' ? EVENT : ATTRIBUTE
        ),
      },
    })
      .innerJoin(
        'patient_record_qualifiers',
        'patient_records.id',
        'patient_record_qualifiers.id',
      )

    if (value.atom !== 'event') {
      return matches_attr
    }

    return matches_attr
      .innerJoin(
        'patient_events',
        'patient_events.id',
        'patient_record_qualifiers.id',
      )
      .where('patient_events.datetime', '=', new Date(value.datetime))
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
        (or (clinical_finding ${snomed_concept_s_expression})
            (finding ${STATUS_ATTRIBUTE.s_expression} ${snomed_concept_s_expression} ${YES_QUALIFIER.s_expression}))
      `),
    )
  },
  '>'(trx, patient, { left, right }) {
    return measurement(trx, patient, left)
      .where((eb) =>
        eb.or([
          eb.and([
            eb('patient_measurements.comparator', '=', '='),
            eb('patient_measurements.value', '>', String(right)),
          ]),
          eb.and([
            eb('patient_measurements.comparator', '=', '>'),
            eb('patient_measurements.value', '>=', String(right)),
          ]),
          eb.and([
            eb('patient_measurements.comparator', '=', '>='),
            eb('patient_measurements.value', '>', String(right)),
          ]),
        ])
      )
  },
  '<'(trx, patient, { left, right }) {
    return measurement(trx, patient, left)
      .where((eb) =>
        eb.or([
          eb.and([
            eb('patient_measurements.comparator', '=', '='),
            eb('patient_measurements.value', '<', String(right)),
          ]),
          eb.and([
            eb('patient_measurements.comparator', '=', '<'),
            eb('patient_measurements.value', '<=', String(right)),
          ]),
          eb.and([
            eb('patient_measurements.comparator', '=', '<='),
            eb('patient_measurements.value', '<', String(right)),
          ]),
        ])
      )
  },
  '>='(trx, patient, { left, right }) {
    return measurement(trx, patient, left)
      .where('patient_measurements.comparator', 'in', ['=', '>', '>='])
      .where('patient_measurements.value', '>=', String(right))
  },
  '<='(trx, patient, { left, right }) {
    return measurement(trx, patient, left)
      .where('patient_measurements.comparator', 'in', ['=', '<', '<='])
      .where('patient_measurements.value', '<=', String(right))
  },
  '='(trx, patient, { left, right }) {
    return measurement(trx, patient, left)
      .where('patient_measurements.comparator', '=', '=')
      .where('patient_measurements.value', '=', String(right))
  },
} satisfies {
  [T in Atom]?: (
    trx: TrxOrDbOrQueryCreator,
    patient: PatientIdentifiers,
    node: AnyNode & { atom: T },
  ) => SelectQueryBuilder<DB, 'patient_records', { id: string }>
}

export function buildExpression(
  trx: TrxOrDbOrQueryCreator,
  patient: PatientIdentifiers,
  node: AnyNode | string,
): SelectQueryBuilder<DB, 'patient_records', { id: string }> {
  if (typeof node === 'string') {
    node = parseExpression(node)
  }

  if (!isKeyOf(node.atom, EXPRESSION_BUILDERS)) {
    throw new Error(`${node.atom} is not directly queryable`)
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
