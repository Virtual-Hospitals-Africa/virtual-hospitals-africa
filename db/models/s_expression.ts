import { IdSelection, Maybe, TrxOrDbOrQueryCreator } from '../../types.ts'
import { SelectQueryBuilder, sql } from 'kysely'
import { DB, Existence } from '../../db.d.ts'
import { assert } from 'std/assert/assert.ts'
import isString from '../../util/isString.ts'
import { isAtom, parseWithSchema } from '../../shared/s_expression.ts'
import { deduplicate } from '../helpers.ts'
import { any_query, Lang, QueryableNode } from '../../shared/s_expression_schemas.ts'
import { inverseSExpressions } from '../../shared/s_expression_inverse.ts'
import { ATTRIBUTE, DUE_TO, EVENT, MEASUREMENT_FINDING, QUALIFIER_VALUE, RELATIONSHIP } from '../../shared/snomed_concepts.ts'
import isKeyOf from '../../util/isKeyOf.ts'
import isObjectLike from '../../util/isObjectLike.ts'
import { diagnosisToEvaluation } from '../../shared/diagnosis.ts'

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
    existence,
    include_negative,
    qualifiers = [],
    attributes = [],
    exact = false,
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
    existence?: Existence | 'Any'
    exact?: boolean
    include_negative?: boolean
  },
) {
  if (include_negative != null) {
    assert(!existence, 'Cannot specify both existence & include_negative')
  }

  const query = trx.selectFrom('patient_records_aggregated')
    .innerJoin('patient_records_still_valid', 'patient_records_aggregated.id', 'patient_records_still_valid.id')
    .where('patient_records_aggregated.patient_id', '=', patient_id)
    .$if(
      !!patient_encounter_id,
      (qb) => qb.where('patient_records_aggregated.patient_encounter_id', '=', patient_encounter_id!),
    )
    .$if(
      !!root_snomed_concept,
      (qb) =>
        qb.where(
          'patient_records_aggregated.root_snomed_concept_id',
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
          const exact_match = eb(
            'patient_records_aggregated.specific_snomed_concept_id',
            '=',
            snomed_concept,
          )

          if (exact) return exact_match

          // If non-exact matches are allowed, this only refers to "Yes" findings
          // This prevents a "No" finding for a descendant being interpreted as a
          // "No" for the whole parent concept
          return eb.or([
            exact_match,
            eb.and([
              eb(
                'patient_records_aggregated.existence',
                '=',
                'Yes',
              ),
              sql<boolean>`
                is_descendant(${eb.ref('patient_records_aggregated.specific_snomed_concept_id')}, ${snomed_concept}::bigint)
              `,
            ]),
          ])
        }),
    )
    .$if(
      !!value_snomed_concept,
      (qb) =>
        qb
          .innerJoin('patient_records', 'patient_records.id', 'patient_records_aggregated.id')
          .where((eb) => {
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
    .$if(
      !!existence && (existence !== 'Any'),
      (qb) => qb.where('patient_records_aggregated.existence', '=', existence as Existence),
    )
    .select('patient_records_aggregated.id')

  const with_qualifiers: typeof query = qualifiers.reduce((qb, qualifier) => (
    qb.where(
      'patient_records_aggregated.id',
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
        'patient_records_aggregated.id',
        'in',
        attribute_query,
      )
    }

    return qb.where((eb) =>
      eb.or([
        eb('patient_records_aggregated.id', 'in', attribute_query),
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
              eb.ref('patient_records_aggregated.specific_snomed_concept_id'),
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
      s_expression: string | QueryableNode
    } & PatientIdentifiers,
  ): Promise<SatisfyingResult> {
    const node = isString(s_expression) ? parseWithSchema(s_expression, any_query) : s_expression

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
      'patient_records_aggregated.id',
      'patient_findings.id',
    )
    .innerJoin(
      'patient_measurements',
      'patient_records_aggregated.id',
      'patient_measurements.id',
    )
    .where(
      'patient_records_aggregated.specific_snomed_concept_id',
      '=',
      snomedConceptBase(trx, snomed_concept),
    )
    .where('patient_measurements.units', '=', units)
}

function evaluation(
  trx: TrxOrDbOrQueryCreator,
  { patient_id, patient_encounter_id }: PatientIdentifiers,
  {
    root_snomed_concept,
    specific_snomed_concept,
    value_snomed_concept,
    evaluates,
    qualifiers,
    /* attributes */
  }: Lang['evaluation'],
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
      'patient_records_aggregated.id',
      'patient_evaluations.id',
    )
    .$if(!!evaluates, (qb) =>
      qb.where((eb) =>
        eb.or([
          eb(
            'patient_evaluations.evaluates_record_id',
            'in',
            buildExpression(
              trx,
              { patient_id, patient_encounter_id },
              evaluates!.expression,
            ),
          ),
          eb(
            'patient_evaluations.id',
            'in',
            buildExpression(
              trx,
              { patient_id, patient_encounter_id },
              evaluates!.expression,
            )
              .clearSelect()
              .innerJoin(
                'patient_record_relations',
                'patient_records_aggregated.id',
                'patient_record_relations.destination_id',
              )
              .innerJoin(
                'patient_records as relation_records',
                'relation_records.id',
                'patient_record_relations.id',
              )
              .where('relation_records.root_snomed_concept_id', '=', RELATIONSHIP.id)
              .where('relation_records.specific_snomed_concept_id', '=', DUE_TO.id)
              .select('patient_record_relations.source_id'),
          ),
        ])
      ))
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
      existence,
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
      existence,
      // For historical findings, look for findings at any point in the patient's history
      patient_encounter_id: history ? null : patient_encounter_id,
    })
      .innerJoin(
        'patient_findings',
        'patient_records_aggregated.id',
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
    let qb = baseQuery(trx, {
      patient_id,
      patient_encounter_id,
      // root_snomed_concept,
      specific_snomed_concept,
      qualifiers,
    })
      .innerJoin(
        'patient_procedures',
        'patient_records_aggregated.id',
        'patient_procedures.id',
      )

    if (isObjectLike(value) && value.atom === 'link') {
      qb = qb.innerJoin(
        'patient_record_links',
        'patient_record_links.id',
        'patient_records_aggregated.id',
      )
        .where(
          'patient_record_links.href',
          '=',
          value.href,
        )
    }
    if (Array.isArray(value)) {
      qb = qb.innerJoin(
        'patient_record_s_expressions',
        'patient_record_s_expressions.id',
        'patient_records_aggregated.id',
      )
        .where(
          'patient_record_s_expressions.s_expression',
          '=',
          inverseSExpressions(value),
        )
    }
    return qb
  },
  evaluation,
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
        'patient_records_aggregated.id',
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
        'patient_records_aggregated.id',
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
      'patient_records_aggregated.id',
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
              'patient_records_aggregated.id',
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
              'patient_records_aggregated.id',
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
  diagnosis(trx, patient, diagnosis) {
    return evaluation(trx, patient, diagnosisToEvaluation(diagnosis))
  },
  measurement,
  // TODO: this is not quite right as this would pull historical findings
  active_condition(trx, { patient_id }, { snomed_concept }) {
    return baseQuery(trx, {
      patient_id,
      existence: 'Yes',
      specific_snomed_concept: snomed_concept,
    }).innerJoin(
      'patient_findings',
      'patient_records_aggregated.id',
      'patient_findings.id',
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
  any2(trx, patient, { expressions }) {
    return baseQuery(trx, patient)
      .where((eb) => {
        // Create a CASE expression for each input expression that evaluates to 1 if true, 0 if false
        const conditions = expressions.map((expression) =>
          eb.case()
            .when(
              eb(
                'patient_records_aggregated.id',
                'in',
                buildExpression(trx, patient, expression),
              ),
            )
            .then(1)
            .else(0)
            .end()
        )

        // Sum all the boolean-to-int conversions and check if >= 2
        return sql<boolean>`(${sql.join(conditions, sql` + `)}) >= 2`
      })
  },
} satisfies {
  [T in QueryableNode['atom']]: (
    trx: TrxOrDbOrQueryCreator,
    patient: PatientIdentifiers,
    node: QueryableNode & { atom: T },
  ) => SelectQueryBuilder<DB, 'patient_records_aggregated', { id: string }>
}

export function buildExpression(
  trx: TrxOrDbOrQueryCreator,
  patient: PatientIdentifiers,
  s_expression: QueryableNode | string,
): SelectQueryBuilder<DB, 'patient_records_aggregated', { id: string }> {
  const node = typeof s_expression === 'string' ? parseWithSchema(s_expression, any_query) : s_expression

  if (!isKeyOf(node.atom, EXPRESSION_BUILDERS)) {
    throw new Error(`${node.atom} is not directly queryable`)
  }

  // deno-lint-ignore ban-types
  const builder = EXPRESSION_BUILDERS[node.atom] as Function
  // deno-lint-ignore no-explicit-any
  return builder(trx, patient, node as any) as SelectQueryBuilder<
    DB,
    'patient_records_aggregated',
    { id: string }
  >
}
