import { type Expression, type QueryCreator, type RawBuilder, type Selectable, sql } from 'kysely'
import type { IPostgresInterval } from 'postgres-interval'
import type { DB, PatientEvents, PatientMeasurements, PatientRecordQualifiers, PatientRecords } from '../../db.d.ts'
import { AgeDetermination, TrxOrDbOrQueryCreator } from '../../types.ts'
import { literalBoolean, literalString } from '../helpers.ts'
import { EVENT, FINDING_SITE, NO_QUALIFIER, QUALIFIER_VALUE, UNKNOWN_QUALIFIER } from '../../shared/snomed_concepts.ts'
import { InsertableFindingBase } from '../../shared/s_expression_schemas.ts'
import { assert } from 'std/assert/assert.ts'
import { snomedConceptBase } from './s_expression.ts'
import generateUUID from '../../util/uuid.ts'

type DueToMatchType = 'finding' | 'measurement' | 'finding_site' | 'event_time_comparison'

export type HypotheticalDueToMatch = {
  due_to_id: string
  s_expression: string
  history: boolean
}

/*
  Due_tos are only ever matched against records that are not yet in the tables: either the
  records a statement is inserting, which its sibling CTEs can only see through RETURNING, or
  a hypothetical record that will never be inserted. Prior records enter the picture later,
  through patient_record_satisfying_due_tos in rules.ts.

  So the matching query never reads patient_records. It reads the CTEs below, which every
  producer guarantees under these names: an insert statement fills them from its INSERT ...
  RETURNING clauses, hypotheticalInputs fills them from literals, and a producer with nothing
  to put in one emits an empty selection of the same shape. The row types are the columns the
  matching query reads, so a CTE returning whole rows satisfies them.
*/
export type DueToRecordRow = Pick<
  Selectable<PatientRecords>,
  'id' | 'root_snomed_concept_id' | 'specific_snomed_concept_id' | 'value_snomed_concept_id' | 'created_at'
>
export type DueToQualifierLinkRow = Pick<Selectable<PatientRecordQualifiers>, 'id' | 'qualifies_record_id'>
export type DueToEventRow = Pick<Selectable<PatientEvents>, 'id' | 'datetime' | 'comparator'>
export type DueToMeasurementRow = Pick<Selectable<PatientMeasurements>, 'id' | 'value'>

export type DueToInputCtes = {
  // The records themselves, the only candidates to satisfy a due_to
  inserting_records: DueToRecordRow
  // Their qualifiers, and the links pointing each at the record it qualifies
  inserting_qualifier_records: DueToRecordRow
  inserting_qualifier_links: DueToQualifierLinkRow
  // Their attributes, including event-valued ones, and the links likewise
  inserting_attribute_records: DueToRecordRow
  inserting_attribute_qualifier_links: DueToQualifierLinkRow
  // The datetime of each event-valued attribute, by attribute record id
  inserting_patient_events: DueToEventRow
  // The value of each measurement record, by record id
  inserting_patient_measurements: DueToMeasurementRow
}

export type DueToInputQuery = QueryCreator<DB & DueToInputCtes>

/*
  Kysely's QueryCreator is invariant in its schema, so a query carrying more CTEs than the
  contract is not assignable to DueToInputQuery. Functions taking a producer's query accept any
  QueryCreator and check the contract structurally with WithDueToInputs instead.
*/
// deno-lint-ignore no-explicit-any
type AnyQueryCreator = QueryCreator<any>

// Q when its schema carries every DueToInputCtes, otherwise never
type WithDueToInputs<Q extends AnyQueryCreator> = Q extends QueryCreator<infer Schema> ? (Schema extends DueToInputCtes ? Q : never) : never

// A SNOMED concept id, as a literal, a column reference or a snomedConceptBase subquery
type ConceptId = string | Expression<string> | ReturnType<typeof snomedConceptBase>

// Rows exist when `descendant` is `ancestor` or one of its active descendants
function descendsFrom(
  qb: AnyQueryCreator,
  { ancestor, descendant }: { ancestor: ConceptId; descendant: ConceptId },
) {
  return qb.selectFrom('snomed_concept_active_descendants_realized')
    .where('snomed_concept_active_descendants_realized.ancestor_id', '=', ancestor)
    .where('snomed_concept_active_descendants_realized.descendant_id', '=', descendant)
    .select('snomed_concept_active_descendants_realized.descendant_id')
}

// Rows exist when SNOMED itself defines `source` as having `attribute_type` = (a descendant of) `value`,
// e.g. Epistaxis has Finding site = Nasal structure without anyone recording it.
function snomedDefinedAttribute(
  qb: AnyQueryCreator,
  { source, attribute_type, value }: { source: ConceptId; attribute_type: ConceptId; value: ConceptId },
) {
  return qb.selectFrom('snomed_relationship')
    .innerJoin(
      'snomed_concept_active_descendants_realized as attribute_value_descendants',
      'attribute_value_descendants.descendant_id',
      'snomed_relationship.destination_id',
    )
    .where('snomed_relationship.active', '=', true)
    .where('snomed_relationship.type_id', '=', attribute_type)
    .where('snomed_relationship.source_id', '=', source)
    .where('attribute_value_descendants.ancestor_id', '=', value)
    .select('snomed_relationship.source_id')
}

/*
  The due_tos satisfied by the records in the DueToInputCtes of `qb`, one row per
  (due_to, record) pair, tagged with which due_to table matched.
*/
function matchingQuery<Q extends AnyQueryCreator>(
  query: Q & WithDueToInputs<Q>,
  { patient_age_determination }: { patient_age_determination: AgeDetermination },
) {
  const qb = query as DueToInputQuery
  const age_filter = sql<AgeDetermination[]>`ARRAY[${patient_age_determination}]::age_determination[]`

  return qb
    // Only a positive record can satisfy a due_to
    .with('due_to_candidates', (qb) =>
      qb.selectFrom('inserting_records')
        .selectAll()
        .where((eb) =>
          eb.or([
            eb('inserting_records.value_snomed_concept_id', 'is', null),
            eb('inserting_records.value_snomed_concept_id', 'not in', [NO_QUALIFIER.id, UNKNOWN_QUALIFIER.id]),
          ])
        ))
    /*
      Every new record that qualifies another, with the id of the record it qualifies. Qualifiers
      and attributes are both recorded as records pointing at the qualified record, so one CTE
      serves every clause below that asks what a candidate is qualified by.
    */
    .with('due_to_qualifying_records', (qb) =>
      qb.selectFrom('inserting_qualifier_records')
        .innerJoin('inserting_qualifier_links', 'inserting_qualifier_links.id', 'inserting_qualifier_records.id')
        .select([
          'inserting_qualifier_records.id',
          'inserting_qualifier_records.root_snomed_concept_id',
          'inserting_qualifier_records.specific_snomed_concept_id',
          'inserting_qualifier_records.value_snomed_concept_id',
          'inserting_qualifier_links.qualifies_record_id',
        ])
        .unionAll(
          qb.selectFrom('inserting_attribute_records')
            .innerJoin('inserting_attribute_qualifier_links', 'inserting_attribute_qualifier_links.id', 'inserting_attribute_records.id')
            .select([
              'inserting_attribute_records.id',
              'inserting_attribute_records.root_snomed_concept_id',
              'inserting_attribute_records.specific_snomed_concept_id',
              'inserting_attribute_records.value_snomed_concept_id',
              'inserting_attribute_qualifier_links.qualifies_record_id',
            ]),
        ))
    .with('matching_due_tos', (qb) => {
      const by_findings_query = qb.selectFrom('due_to_findings')
        .innerJoin('due_to', 'due_to_findings.id', 'due_to.id')
        .innerJoin(
          'snomed_concept_active_descendants_realized as specific_descendants',
          'specific_descendants.ancestor_id',
          'due_to_findings.specific_snomed_concept_id',
        )
        .innerJoin('due_to_candidates', 'due_to_candidates.specific_snomed_concept_id', 'specific_descendants.descendant_id')
        .where('due_to.age_determinations', '@>', age_filter)
        .whereRef('due_to_candidates.root_snomed_concept_id', '=', 'due_to_findings.root_snomed_concept_id')
        .where((eb) =>
          eb.or([
            eb('due_to_findings.value_snomed_concept_id', 'is', null),
            eb.exists(
              descendsFrom(qb, {
                ancestor: eb.ref('due_to_findings.value_snomed_concept_id').$notNull(),
                descendant: eb.ref('due_to_candidates.value_snomed_concept_id').$notNull(),
              }),
            ),
          ])
        )
        /*
          Every due_to_qualifier must be satisfied by the candidate. due_to_qualifiers holds one row
          per qualifier and per attribute of the due_to. A qualifier row leaves root and value null,
          which reads here as "unconstrained".

          The clauses below err towards admitting a row — no datetime check on event-valued
          attributes — rather than dropping a real match.
        */
        .where((eb) =>
          eb.or([
            eb('due_to_findings.is_somehow_qualified', '=', false),
            eb.not(eb.exists(
              eb.selectFrom('due_to_qualifiers')
                .whereRef('due_to_qualifiers.due_to_id', '=', 'due_to.id')
                .where((eb) =>
                  eb.not(eb.or([
                    // Explicitly recorded as a qualifier or attribute of the candidate
                    eb.exists(
                      eb.selectFrom('due_to_qualifying_records')
                        .innerJoin(
                          'snomed_concept_active_descendants_realized as qualifier_specific_descendants',
                          (join) =>
                            join
                              .onRef('qualifier_specific_descendants.descendant_id', '=', 'due_to_qualifying_records.specific_snomed_concept_id')
                              .on('qualifier_specific_descendants.ancestor_id', '=', eb.ref('due_to_qualifiers.specific_snomed_concept_id')),
                        )
                        .whereRef('due_to_qualifying_records.qualifies_record_id', '=', 'due_to_candidates.id')
                        .where((eb) =>
                          eb.or([
                            eb('due_to_qualifiers.root_snomed_concept_id', 'is', null),
                            eb('due_to_qualifying_records.root_snomed_concept_id', '=', eb.ref('due_to_qualifiers.root_snomed_concept_id')),
                          ])
                        )
                        .where((eb) =>
                          eb.or([
                            eb('due_to_qualifiers.value_snomed_concept_id', 'is', null),
                            eb.exists(
                              descendsFrom(qb, {
                                ancestor: eb.ref('due_to_qualifiers.value_snomed_concept_id').$notNull(),
                                descendant: eb.ref('due_to_qualifying_records.value_snomed_concept_id').$notNull(),
                              }),
                            ),
                          ])
                        )
                        .select('due_to_qualifying_records.id'),
                    ),
                    // Or implied by SNOMED itself. Never matches when value is null.
                    eb.exists(
                      snomedDefinedAttribute(qb, {
                        source: eb.ref('due_to_candidates.specific_snomed_concept_id'),
                        attribute_type: eb.ref('due_to_qualifiers.specific_snomed_concept_id'),
                        value: eb.ref('due_to_qualifiers.value_snomed_concept_id').$notNull(),
                      }),
                    ),
                  ]))
                ),
            )),
          ])
        )
        .select([
          literalString('finding' as DueToMatchType).as('type'),
          'due_to.id as due_to_id',
          'due_to_candidates.id as patient_record_id',
          'due_to.s_expression',
          'due_to.history',
        ])

      const by_finding_sites_query = qb.selectFrom('due_to_finding_sites')
        .innerJoin('due_to', 'due_to.id', 'due_to_finding_sites.id')
        .innerJoin('due_to_candidates', (join) => join.onTrue())
        .where('due_to.age_determinations', '@>', age_filter)
        .where((eb) =>
          eb.or([
            // Recorded as a finding_site attribute of the candidate
            eb.exists(
              eb.selectFrom('due_to_qualifying_records as finding_sites')
                .innerJoin(
                  'snomed_concept_active_descendants_realized as dest_descendants',
                  (join) =>
                    join
                      .onRef('dest_descendants.descendant_id', '=', 'finding_sites.value_snomed_concept_id')
                      .on('dest_descendants.ancestor_id', '=', eb.ref('due_to_finding_sites.value_snomed_concept_id')),
                )
                .whereRef('finding_sites.qualifies_record_id', '=', 'due_to_candidates.id')
                .where('finding_sites.specific_snomed_concept_id', '=', FINDING_SITE.id)
                .select('finding_sites.id'),
            ),
            // Or implied by SNOMED itself
            eb.exists(
              snomedDefinedAttribute(qb, {
                source: eb.ref('due_to_candidates.specific_snomed_concept_id'),
                attribute_type: FINDING_SITE.id,
                value: eb.ref('due_to_finding_sites.value_snomed_concept_id'),
              }),
            ),
          ])
        )
        .select([
          literalString('finding_site' as DueToMatchType).as('type'),
          'due_to.id as due_to_id',
          'due_to_candidates.id as patient_record_id',
          'due_to.s_expression',
          'due_to.history',
        ])

      const by_measurements_query = qb.selectFrom('due_to_measurements')
        .innerJoin('due_to', 'due_to.id', 'due_to_measurements.id')
        .innerJoin('due_to_candidates', 'due_to_candidates.specific_snomed_concept_id', 'due_to_measurements.specific_snomed_concept_id')
        .innerJoin('inserting_patient_measurements', 'inserting_patient_measurements.id', 'due_to_candidates.id')
        .where('due_to.age_determinations', '@>', age_filter)
        .where((eb) =>
          eb.or([
            eb.and([
              eb('due_to_measurements.comparator', '=', '>'),
              eb('inserting_patient_measurements.value', '>', eb.ref('due_to_measurements.value')),
            ]),
            eb.and([
              eb('due_to_measurements.comparator', '=', '>='),
              eb('inserting_patient_measurements.value', '>=', eb.ref('due_to_measurements.value')),
            ]),
            eb.and([
              eb('due_to_measurements.comparator', '=', '<'),
              eb('inserting_patient_measurements.value', '<', eb.ref('due_to_measurements.value')),
            ]),
            eb.and([
              eb('due_to_measurements.comparator', '=', '<='),
              eb('inserting_patient_measurements.value', '<=', eb.ref('due_to_measurements.value')),
            ]),
          ])
        )
        .select([
          literalString('measurement' as DueToMatchType).as('type'),
          'due_to.id as due_to_id',
          'due_to_candidates.id as patient_record_id',
          'due_to.s_expression',
          'due_to.history',
        ])

      const by_event_time_comparisons_query = qb.selectFrom('due_to_event_time_comparisons')
        .innerJoin('due_to', 'due_to.id', 'due_to_event_time_comparisons.id')
        .innerJoin(
          'snomed_concept_active_descendants_realized as specific_descendants',
          'specific_descendants.ancestor_id',
          'due_to_event_time_comparisons.specific_snomed_concept_id',
        )
        .innerJoin('due_to_candidates', 'due_to_candidates.specific_snomed_concept_id', 'specific_descendants.descendant_id')
        .where('due_to.age_determinations', '@>', age_filter)
        // root is null when the subject was an active_condition
        .where((eb) =>
          eb.or([
            eb('due_to_event_time_comparisons.root_snomed_concept_id', 'is', null),
            eb('due_to_candidates.root_snomed_concept_id', '=', eb.ref('due_to_event_time_comparisons.root_snomed_concept_id')),
          ])
        )
        // The event (e.g. onset) is an attribute record with root Event; inserting_patient_events holds its datetime
        .innerJoin('due_to_qualifying_records as event_records', 'event_records.qualifies_record_id', 'due_to_candidates.id')
        .innerJoin(
          'snomed_concept_active_descendants_realized as event_descendants',
          'event_descendants.descendant_id',
          'event_records.specific_snomed_concept_id',
        )
        .innerJoin('inserting_patient_events', 'inserting_patient_events.id', 'event_records.id')
        .where('event_records.root_snomed_concept_id', '=', EVENT.id)
        .whereRef('event_descendants.ancestor_id', '=', 'due_to_event_time_comparisons.event_snomed_concept_id')
        /*
          actual_duration = created_at - onset, i.e. how long ago the event was at entry (now(),
          for a hypothetical). The event's comparator qualifies its datetime in time-ago space, so
          a row only matches when its own range guarantees the rule's: ('>=', t) means "at or
          before t", which can satisfy a >= duration but never a <= one. Mirrors the '>=' and
          '<=' builders in s_expression.ts.
        */
        .where((eb) => {
          const actual_duration = sql<IPostgresInterval>`${eb.ref('due_to_candidates.created_at')} - ${eb.ref('inserting_patient_events.datetime')}`
          return eb.or([
            eb.and([
              eb('due_to_event_time_comparisons.comparator', '=', '>='),
              eb('inserting_patient_events.comparator', 'in', ['=', '>', '>=']),
              eb(actual_duration, '>=', eb.ref('due_to_event_time_comparisons.duration')),
            ]),
            eb.and([
              eb('due_to_event_time_comparisons.comparator', '=', '<='),
              eb('inserting_patient_events.comparator', 'in', ['=', '<', '<=']),
              eb(actual_duration, '<=', eb.ref('due_to_event_time_comparisons.duration')),
            ]),
          ])
        })
        .select([
          literalString('event_time_comparison' as DueToMatchType).as('type'),
          'due_to.id as due_to_id',
          'due_to_candidates.id as patient_record_id',
          'due_to.s_expression',
          'due_to.history',
        ])

      return by_findings_query
        .unionAll(by_finding_sites_query)
        .unionAll(by_measurements_query)
        .unionAll(by_event_time_comparisons_query)
    })
    .selectFrom('matching_due_tos')
    .selectAll('matching_due_tos')
}

/*
  Tag the records a statement is inserting with the due_tos they satisfy, in that same
  statement. `query` must already carry the DueToInputCtes.
*/
export function withTaggingOfInsertedRecords<Q extends AnyQueryCreator>(
  query: Q & WithDueToInputs<Q>,
  { patient_age_determination }: { patient_age_determination: AgeDetermination },
): Q {
  return query.with('inserting_due_tos', (qb: AnyQueryCreator) =>
    qb.insertInto('patient_record_satisfying_due_tos')
      .columns(['due_to_id', 'patient_record_id'])
      .expression(
        matchingQuery(qb, { patient_age_determination })
          .clearSelect()
          .select(['matching_due_tos.due_to_id', 'matching_due_tos.patient_record_id']),
      )) as unknown as Q
}

/*
  The DueToInputCtes for a finding that has not been inserted, built from literals exactly as
  patient_findings.insertMany would insert it: the finding itself, a qualifier record per
  qualifier, an attribute record per attribute and an event per event-valued attribute. Only
  the finding's direct qualifiers count, as with an inserted finding.
*/
function hypotheticalInputs(trx: TrxOrDbOrQueryCreator, finding: InsertableFindingBase) {
  assert(finding.existence === 'Yes', 'Only a positive finding can satisfy a due_to')

  const record_id = generateUUID()
  const uuid = (id: string) => sql<string>`${sql.lit(id)}::uuid`
  const concept_id = (id: string) => sql<string>`${sql.lit(id)}::bigint`
  const null_concept_id = sql<string | null>`null::bigint`
  // A hypothetical is measured from now, as an inserted record is from its created_at
  const created_at = sql<Date>`now()`

  // A concept id as a literal or a snomedConceptBase subquery, either of which can be aliased
  type ConceptIdExpression = RawBuilder<string | null> | ReturnType<typeof snomedConceptBase>
  type RecordLiteral = {
    id: string
    root_snomed_concept_id: ConceptIdExpression
    specific_snomed_concept_id: ConceptIdExpression
    value_snomed_concept_id: ConceptIdExpression
    qualifies_record_id: string
  }

  const qualifiers: RecordLiteral[] = finding.qualifiers.map((qualifier) => ({
    id: generateUUID(),
    root_snomed_concept_id: concept_id(QUALIFIER_VALUE.id),
    specific_snomed_concept_id: snomedConceptBase(trx, qualifier.specific_snomed_concept),
    value_snomed_concept_id: null_concept_id,
    qualifies_record_id: record_id,
  }))

  const attributes = finding.attributes.map((attribute) => {
    const record: RecordLiteral = {
      id: generateUUID(),
      root_snomed_concept_id: attribute.value.atom === 'event' ? concept_id(EVENT.id) : snomedConceptBase(trx, attribute.root_snomed_concept),
      specific_snomed_concept_id: snomedConceptBase(trx, attribute.specific_snomed_concept),
      value_snomed_concept_id: attribute.value.atom === 'event' ? null_concept_id : snomedConceptBase(trx, attribute.value),
      qualifies_record_id: record_id,
    }
    return { record, event: attribute.value.atom === 'event' ? attribute.value : null }
  })

  function recordRows(qb: AnyQueryCreator, records: RecordLiteral[]) {
    if (!records.length) {
      return qb.selectFrom('patient_records')
        .select(['id', 'root_snomed_concept_id', 'specific_snomed_concept_id', 'value_snomed_concept_id', 'created_at'])
        .where(literalBoolean(false))
        .$castTo<DueToRecordRow>()
    }
    return records
      .map((record) =>
        qb.selectNoFrom([
          uuid(record.id).as('id'),
          record.root_snomed_concept_id.as('root_snomed_concept_id'),
          record.specific_snomed_concept_id.as('specific_snomed_concept_id'),
          record.value_snomed_concept_id.as('value_snomed_concept_id'),
          created_at.as('created_at'),
        ]).$castTo<DueToRecordRow>()
      )
      .reduce((all, row) => all.unionAll(row))
  }

  function linkRows(qb: AnyQueryCreator, records: RecordLiteral[]) {
    if (!records.length) {
      return qb.selectFrom('patient_record_qualifiers')
        .select(['id', 'qualifies_record_id'])
        .where(literalBoolean(false))
        .$castTo<DueToQualifierLinkRow>()
    }
    return records
      .map((record) =>
        qb.selectNoFrom([
          uuid(record.id).as('id'),
          uuid(record.qualifies_record_id).as('qualifies_record_id'),
        ]).$castTo<DueToQualifierLinkRow>()
      )
      .reduce((all, row) => all.unionAll(row))
  }

  function eventRows(qb: AnyQueryCreator, events: { id: string; datetime: string }[]) {
    if (!events.length) {
      return qb.selectFrom('patient_events')
        .select(['id', 'datetime', 'comparator'])
        .where(literalBoolean(false))
        .$castTo<DueToEventRow>()
    }
    return events
      .map(({ id, datetime }) =>
        qb.selectNoFrom([
          uuid(id).as('id'),
          sql<Date>`${sql.lit(datetime)}::timestamptz`.as('datetime'),
          literalString('=').as('comparator'),
        ]).$castTo<DueToEventRow>()
      )
      .reduce((all, row) => all.unionAll(row))
  }

  const events = attributes.flatMap(({ record, event }) => event ? [{ id: record.id, datetime: event.datetime }] : [])

  return trx
    .with('inserting_records', (qb) =>
      recordRows(qb, [{
        id: record_id,
        root_snomed_concept_id: snomedConceptBase(trx, finding.root_snomed_concept),
        specific_snomed_concept_id: snomedConceptBase(trx, finding.specific_snomed_concept),
        value_snomed_concept_id: finding.value_snomed_concept ? snomedConceptBase(trx, finding.value_snomed_concept) : null_concept_id,
        qualifies_record_id: record_id,
      }]))
    .with('inserting_qualifier_records', (qb) => recordRows(qb, qualifiers))
    .with('inserting_qualifier_links', (qb) => linkRows(qb, qualifiers))
    .with('inserting_attribute_records', (qb) => recordRows(qb, attributes.map((a) => a.record)))
    .with('inserting_attribute_qualifier_links', (qb) => linkRows(qb, attributes.map((a) => a.record)))
    .with('inserting_patient_events', (qb) => eventRows(qb, events))
    // A clinical finding is never a measurement
    .with('inserting_patient_measurements', (qb) =>
      qb.selectFrom('patient_measurements')
        .select(['id', 'value'])
        .where(literalBoolean(false))
        .$castTo<DueToMeasurementRow>())
}

export const due_to = {
  matchingQuery,
  hypotheticalInputs,

  /*
    Which due_tos a finding that has not been inserted would satisfy, evaluated by the same
    query that tags inserted records, over literal rows in place of RETURNING output.
  */
  forHypotheticalFinding(
    trx: TrxOrDbOrQueryCreator,
    { patient_age_determination, finding }: {
      patient_age_determination: AgeDetermination
      finding: InsertableFindingBase
    },
  ): Promise<HypotheticalDueToMatch[]> {
    if (finding.existence !== 'Yes') return Promise.resolve([])

    return matchingQuery(hypotheticalInputs(trx, finding), { patient_age_determination }).execute()
  },
}
