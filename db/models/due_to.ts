import { type Expression, sql } from 'kysely'
import type { IPostgresInterval } from 'postgres-interval'
import { AgeDetermination, IdSelectable, NewRecordsToConsider, NewRecordsToConsiderWithSatisfyingDueToIds, TrxOrDbOrQueryCreator } from '../../types.ts'
import { idSelection, literalBoolean, literalString } from '../helpers.ts'
import { EVENT, FINDING_SITE, QUALIFIER_VALUE } from '../../shared/snomed_concepts.ts'
import { isAtom, parseWithSchema } from '../../shared/s_expression.ts'
import { any_query_single, InsertableFindingBase, Lang } from '../../shared/s_expression_schemas.ts'
import { base, identity } from './_base.ts'
import { arrayIsEmpty } from '../../util/arraySize.ts'
import { assert } from 'std/assert/assert.ts'
import pick from '../../util/pick.ts'
import { pMap } from '../../util/inParallel.ts'
import { buildExpression, snomedConceptBase } from './s_expression.ts'
import compact from '../../util/compact.ts'
import { events } from './events.ts'
import isString from '../../util/isString.ts'

type DueToMatchType = 'finding' | 'measurement' | 'finding_site' | 'event_time_comparison'

export type HypotheticalDueToMatch = {
  due_to_id: string
  s_expression: string
  history: boolean
}

/*
  The records to match due_tos against: either records already in patient_records, or a
  single finding node that has not been inserted, e.g. to preview which tasks a health worker
  would be prompted for. The explicit case evaluates the same clauses against the node's own
  concepts, qualifiers and attributes as they would be inserted by patient_findings.insertMany.
*/
export type PositiveRecords = {
  type: 'by_id'
  ids: IdSelectable
} | {
  type: 'explicit'
  finding: InsertableFindingBase
}

// A SNOMED concept id, as a literal, a column reference or a snomedConceptBase subquery
type ConceptId = string | Expression<string> | ReturnType<typeof snomedConceptBase>

// Rows exist when `descendant` is `ancestor` or one of its active descendants
function descendsFrom(
  trx: TrxOrDbOrQueryCreator,
  { ancestor, descendant }: { ancestor: ConceptId; descendant: ConceptId },
) {
  return trx.selectFrom('snomed_concept_active_descendants_realized')
    .where('snomed_concept_active_descendants_realized.ancestor_id', '=', ancestor)
    .where('snomed_concept_active_descendants_realized.descendant_id', '=', descendant)
    .select('snomed_concept_active_descendants_realized.descendant_id')
}

// Rows exist when SNOMED itself defines `source` as having `attribute_type` = (a descendant of) `value`,
// e.g. Epistaxis has Finding site = Nasal structure without anyone recording it.
function snomedDefinedAttribute(
  trx: TrxOrDbOrQueryCreator,
  { source, attribute_type, value }: { source: ConceptId; attribute_type: ConceptId; value: ConceptId },
) {
  return trx.selectFrom('snomed_relationship')
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

export const due_to = base({
  top_level_table: 'due_to',
  baseQuery(trx: TrxOrDbOrQueryCreator, {
    // patient_id,
    patient_age_determination,
    positive_records,
  }: {
    patient_id?: string
    patient_age_determination: AgeDetermination
    positive_records: PositiveRecords
  }) {
    const by_id = positive_records.type === 'by_id' ? positive_records : null
    const explicit = positive_records.type === 'explicit' ? positive_records.finding : null

    if (by_id && Array.isArray(by_id.ids)) {
      assert(by_id.ids.length)
    }
    if (explicit) {
      assert(explicit.existence === 'Yes', 'Only a positive finding can satisfy a due_to')
    }

    const age_filter = sql<AgeDetermination[]>`ARRAY[${patient_age_determination}]::age_determination[]`

    // There is no patient_records row to point back at in the explicit case
    const patient_record_id = by_id
      ? sql<string>`${sql.ref('patient_records.id')}`.as('patient_record_id')
      : literalString('unusedexplicit').as('patient_record_id')

    /*
      The qualifier and attribute records an explicit finding would be inserted with, as in
      patient_records.ts and patient_findings.insertMany. Only direct qualifiers count, matching
      the by_id case, which reads the patient_record_qualifiers of the record itself.
    */
    const explicit_qualifying_records = explicit
      ? [
        ...explicit.qualifiers.map((qualifier) => ({
          root_snomed_concept_id: QUALIFIER_VALUE.id,
          specific_snomed_concept_id: snomedConceptBase(trx, qualifier.specific_snomed_concept),
          value_snomed_concept_id: null,
        })),
        ...explicit.attributes.map((attribute) => ({
          root_snomed_concept_id: attribute.value.atom === 'event' ? EVENT.id : snomedConceptBase(trx, attribute.root_snomed_concept),
          specific_snomed_concept_id: snomedConceptBase(trx, attribute.specific_snomed_concept),
          value_snomed_concept_id: attribute.value.atom === 'event' ? null : snomedConceptBase(trx, attribute.value),
        })),
      ]
      : []

    const explicit_finding_sites = explicit
      ? compact(
        explicit.attributes.map((attribute) =>
          attribute.specific_snomed_concept.name === FINDING_SITE.name && attribute.value.atom === 'snomed_concept' && attribute.value
        ),
      )
      : []

    const explicit_events = explicit
      ? compact(
        explicit.attributes.map((attribute) =>
          attribute.value.atom === 'event' && {
            specific_snomed_concept: attribute.specific_snomed_concept,
            datetime: attribute.value.datetime,
          }
        ),
      )
      : []

    const by_findings_query = trx.selectFrom('due_to_findings')
      .innerJoin('due_to', 'due_to_findings.id', 'due_to.id')
      .innerJoin(
        'snomed_concept_active_descendants_realized as specific_descendants',
        'specific_descendants.ancestor_id',
        'due_to_findings.specific_snomed_concept_id',
      )
      .where('due_to.age_determinations', '@>', age_filter)
      .$if(!!by_id, (qb) =>
        qb
          .innerJoin('patient_records', 'patient_records.specific_snomed_concept_id', 'specific_descendants.descendant_id')
          .innerJoin('patient_records_still_valid', 'patient_records_still_valid.id', 'patient_records.id')
          .where('patient_records.id', ...idSelection(by_id!.ids))
          .whereRef('patient_records.root_snomed_concept_id', '=', 'due_to_findings.root_snomed_concept_id')
          .where((eb) =>
            eb.or([
              eb('due_to_findings.value_snomed_concept_id', 'is', null),
              eb.exists(
                descendsFrom(trx, {
                  ancestor: eb.ref('due_to_findings.value_snomed_concept_id').$notNull(),
                  descendant: eb.ref('patient_records.value_snomed_concept_id').$notNull(),
                }),
              ),
            ])
          )
          /*
            Every due_to_qualifier must be satisfied by the record. due_to_qualifiers holds one row
            per qualifier and per attribute of the due_to; both are recorded on the patient side as
            records pointing at the matched record through patient_record_qualifiers, so one join
            covers both. A qualifier row leaves root and value null, which reads here as "unconstrained".

            The clauses below err towards admitting a row — no datetime check on event-valued
            attributes, no existence check on the qualifying records — rather than dropping a real match.
          */
          .where((eb) =>
            eb.or([
              eb('due_to_findings.is_somehow_qualified', '=', false),
              eb.not(eb.exists(
                eb.selectFrom('due_to_qualifiers')
                  .whereRef('due_to_qualifiers.due_to_id', '=', 'due_to.id')
                  .where((eb) =>
                    eb.not(eb.or([
                      // Explicitly recorded as a qualifier or attribute of the record
                      eb.exists(
                        eb.selectFrom('patient_records as qualifying_records')
                          .innerJoin('patient_record_qualifiers', 'patient_record_qualifiers.id', 'qualifying_records.id')
                          .innerJoin('patient_records_still_valid as qualifying_records_valid', 'qualifying_records_valid.id', 'qualifying_records.id')
                          .innerJoin(
                            'snomed_concept_active_descendants_realized as qualifier_specific_descendants',
                            (join) =>
                              join
                                .onRef('qualifier_specific_descendants.descendant_id', '=', 'qualifying_records.specific_snomed_concept_id')
                                .on('qualifier_specific_descendants.ancestor_id', '=', eb.ref('due_to_qualifiers.specific_snomed_concept_id')),
                          )
                          .whereRef('patient_record_qualifiers.qualifies_record_id', '=', 'patient_records.id')
                          .where((eb) =>
                            eb.or([
                              eb('due_to_qualifiers.root_snomed_concept_id', 'is', null),
                              eb('qualifying_records.root_snomed_concept_id', '=', eb.ref('due_to_qualifiers.root_snomed_concept_id')),
                            ])
                          )
                          .where((eb) =>
                            eb.or([
                              eb('due_to_qualifiers.value_snomed_concept_id', 'is', null),
                              eb.exists(
                                descendsFrom(trx, {
                                  ancestor: eb.ref('due_to_qualifiers.value_snomed_concept_id').$notNull(),
                                  descendant: eb.ref('qualifying_records.value_snomed_concept_id').$notNull(),
                                }),
                              ),
                            ])
                          ),
                      ),
                      // Or implied by SNOMED itself. Never matches when value is null.
                      eb.exists(
                        snomedDefinedAttribute(trx, {
                          source: eb.ref('patient_records.specific_snomed_concept_id'),
                          attribute_type: eb.ref('due_to_qualifiers.specific_snomed_concept_id'),
                          value: eb.ref('due_to_qualifiers.value_snomed_concept_id').$notNull(),
                        }),
                      ),
                    ]))
                  ),
              )),
            ])
          ))
      .$if(!!explicit, (qb) =>
        qb
          .where('specific_descendants.descendant_id', '=', snomedConceptBase(trx, explicit!.specific_snomed_concept))
          .where('due_to_findings.root_snomed_concept_id', '=', snomedConceptBase(trx, explicit!.root_snomed_concept))
          .where((eb) =>
            eb.or([
              eb('due_to_findings.value_snomed_concept_id', 'is', null),
              ...(explicit!.value_snomed_concept
                ? [
                  eb.exists(
                    descendsFrom(trx, {
                      ancestor: eb.ref('due_to_findings.value_snomed_concept_id').$notNull(),
                      descendant: snomedConceptBase(trx, explicit!.value_snomed_concept),
                    }),
                  ),
                ]
                : []),
            ])
          )
          // As above, against the qualifier and attribute records the node would be inserted with
          .where((eb) =>
            eb.or([
              eb('due_to_findings.is_somehow_qualified', '=', false),
              eb.not(eb.exists(
                eb.selectFrom('due_to_qualifiers')
                  .whereRef('due_to_qualifiers.due_to_id', '=', 'due_to.id')
                  .where((eb) =>
                    eb.not(eb.or([
                      // Explicitly recorded as a qualifier or attribute of the finding
                      ...explicit_qualifying_records.map((record) =>
                        eb.and([
                          eb.exists(
                            descendsFrom(trx, {
                              ancestor: eb.ref('due_to_qualifiers.specific_snomed_concept_id'),
                              descendant: record.specific_snomed_concept_id,
                            }),
                          ),
                          eb.or([
                            eb('due_to_qualifiers.root_snomed_concept_id', 'is', null),
                            eb('due_to_qualifiers.root_snomed_concept_id', '=', record.root_snomed_concept_id),
                          ]),
                          eb.or([
                            eb('due_to_qualifiers.value_snomed_concept_id', 'is', null),
                            ...(record.value_snomed_concept_id
                              ? [
                                eb.exists(
                                  descendsFrom(trx, {
                                    ancestor: eb.ref('due_to_qualifiers.value_snomed_concept_id').$notNull(),
                                    descendant: record.value_snomed_concept_id,
                                  }),
                                ),
                              ]
                              : []),
                          ]),
                        ])
                      ),
                      // Or implied by SNOMED itself. Never matches when value is null.
                      eb.exists(
                        snomedDefinedAttribute(trx, {
                          source: snomedConceptBase(trx, explicit!.specific_snomed_concept),
                          attribute_type: eb.ref('due_to_qualifiers.specific_snomed_concept_id'),
                          value: eb.ref('due_to_qualifiers.value_snomed_concept_id').$notNull(),
                        }),
                      ),
                    ]))
                  ),
              )),
            ])
          ))
      .select([
        literalString('finding' as DueToMatchType).as('type'),
        'due_to.id as due_to_id',
        patient_record_id,
        'due_to.s_expression',
        'due_to.history',
      ])

    const by_finding_sites_query = trx.selectFrom('due_to_finding_sites')
      .innerJoin('due_to', 'due_to.id', 'due_to_finding_sites.id')
      .where('due_to.age_determinations', '@>', age_filter)
      .$if(!!by_id, (qb) =>
        qb
          .innerJoin('patient_records', (join) => join.onTrue())
          .innerJoin('patient_records_still_valid', 'patient_records_still_valid.id', 'patient_records.id')
          .where('patient_records.id', ...idSelection(by_id!.ids))
          .where((eb) =>
            eb.or([
              // Recorded as a finding_site attribute of the record
              eb.exists(
                trx.selectFrom('patient_records as finding_sites')
                  .innerJoin('patient_record_qualifiers', 'finding_sites.id', 'patient_record_qualifiers.id')
                  .innerJoin(
                    'snomed_concept_active_descendants_realized as dest_descendants',
                    (join) =>
                      join
                        .onRef('dest_descendants.descendant_id', '=', 'finding_sites.value_snomed_concept_id')
                        .on('dest_descendants.ancestor_id', '=', eb.ref('due_to_finding_sites.value_snomed_concept_id')),
                  )
                  .where('patient_record_qualifiers.qualifies_record_id', '=', eb.ref('patient_records.id'))
                  .where('finding_sites.specific_snomed_concept_id', '=', FINDING_SITE.id),
              ),
              // Or implied by SNOMED itself
              eb.exists(
                snomedDefinedAttribute(trx, {
                  source: eb.ref('patient_records.specific_snomed_concept_id'),
                  attribute_type: FINDING_SITE.id,
                  value: eb.ref('due_to_finding_sites.value_snomed_concept_id'),
                }),
              ),
            ])
          ))
      .$if(!!explicit, (qb) =>
        qb.where((eb) =>
          eb.or([
            // Recorded as a finding_site attribute of the finding
            ...explicit_finding_sites.map((finding_site) =>
              eb.exists(
                descendsFrom(trx, {
                  ancestor: eb.ref('due_to_finding_sites.value_snomed_concept_id'),
                  descendant: snomedConceptBase(trx, finding_site),
                }),
              )
            ),
            // Or implied by SNOMED itself
            eb.exists(
              snomedDefinedAttribute(trx, {
                source: snomedConceptBase(trx, explicit!.specific_snomed_concept),
                attribute_type: FINDING_SITE.id,
                value: eb.ref('due_to_finding_sites.value_snomed_concept_id'),
              }),
            ),
          ])
        ))
      .select([
        literalString('finding_site' as DueToMatchType).as('type'),
        'due_to.id as due_to_id',
        patient_record_id,
        'due_to.s_expression',
        'due_to.history',
      ])

    const by_measurements_query = trx.selectFrom('due_to_measurements')
      .innerJoin('due_to', 'due_to.id', 'due_to_measurements.id')
      .where('due_to.age_determinations', '@>', age_filter)
      .$if(!!by_id, (qb) =>
        qb
          .innerJoin('patient_records', 'patient_records.specific_snomed_concept_id', 'due_to_measurements.specific_snomed_concept_id')
          .innerJoin('patient_records_still_valid', 'patient_records_still_valid.id', 'patient_records.id')
          .innerJoin('patient_measurements', 'patient_records.id', 'patient_measurements.id')
          .where('patient_records.id', ...idSelection(by_id!.ids))
          .where((eb) =>
            eb.or([
              eb.and([
                eb('due_to_measurements.comparator', '=', '>'),
                eb('patient_measurements.value', '>', eb.ref('due_to_measurements.value')),
              ]),
              eb.and([
                eb('due_to_measurements.comparator', '=', '>='),
                eb('patient_measurements.value', '>=', eb.ref('due_to_measurements.value')),
              ]),
              eb.and([
                eb('due_to_measurements.comparator', '=', '<'),
                eb('patient_measurements.value', '<', eb.ref('due_to_measurements.value')),
              ]),
              eb.and([
                eb('due_to_measurements.comparator', '=', '<='),
                eb('patient_measurements.value', '<=', eb.ref('due_to_measurements.value')),
              ]),
            ])
          ))
      // A clinical finding is never a measurement, so an explicit finding satisfies no measurement due_to
      .$if(!!explicit, (qb) => qb.where(literalBoolean(false)))
      .select([
        literalString('measurement' as DueToMatchType).as('type'),
        'due_to.id as due_to_id',
        patient_record_id,
        'due_to.s_expression',
        'due_to.history',
      ])

    const by_event_time_comparisons_query = trx.selectFrom('due_to_event_time_comparisons')
      .innerJoin('due_to', 'due_to.id', 'due_to_event_time_comparisons.id')
      .innerJoin(
        'snomed_concept_active_descendants_realized as specific_descendants',
        'specific_descendants.ancestor_id',
        'due_to_event_time_comparisons.specific_snomed_concept_id',
      )
      .where('due_to.age_determinations', '@>', age_filter)
      .$if(!!by_id, (qb) =>
        qb
          .innerJoin('patient_records', 'patient_records.specific_snomed_concept_id', 'specific_descendants.descendant_id')
          .innerJoin('patient_records_still_valid', 'patient_records_still_valid.id', 'patient_records.id')
          .where('patient_records.id', ...idSelection(by_id!.ids))
          // root is null when the subject was an active_condition
          .where((eb) =>
            eb.or([
              eb('due_to_event_time_comparisons.root_snomed_concept_id', 'is', null),
              eb('patient_records.root_snomed_concept_id', '=', eb.ref('due_to_event_time_comparisons.root_snomed_concept_id')),
            ])
          )
          /*
            The event (e.g. onset) is an attribute record with root Event pointing at the
            subject through patient_record_qualifiers; patient_events holds its datetime.
            Historical qualifiers still count, as in attribute() in s_expression.ts, so the
            event record is not required to be still valid.
          */
          .innerJoin('patient_record_qualifiers as event_qualifiers', 'event_qualifiers.qualifies_record_id', 'patient_records.id')
          .innerJoin('patient_records as event_records', 'event_records.id', 'event_qualifiers.id')
          .innerJoin(
            'snomed_concept_active_descendants_realized as event_descendants',
            'event_descendants.descendant_id',
            'event_records.specific_snomed_concept_id',
          )
          .innerJoin('patient_events', 'patient_events.id', 'event_records.id')
          .where('event_records.root_snomed_concept_id', '=', EVENT.id)
          .whereRef('event_descendants.ancestor_id', '=', 'due_to_event_time_comparisons.event_snomed_concept_id')
          /*
            actual_duration = patient_records.created_at - onset, i.e. how long ago the event was
            at entry. patient_events.comparator qualifies the stored datetime in time-ago space, so
            a stored row only matches when its own range guarantees the rule's: ('>=', t) means
            "at or before t", which can satisfy a >= duration but never a <= one. Mirrors the
            '>=' and '<=' builders in s_expression.ts.
          */
          .where((eb) => {
            const actual_duration = sql<IPostgresInterval>`${eb.ref('patient_records.created_at')} - ${eb.ref('patient_events.datetime')}`
            return eb.or([
              eb.and([
                eb('due_to_event_time_comparisons.comparator', '=', '>='),
                eb('patient_events.comparator', 'in', ['=', '>', '>=']),
                eb(actual_duration, '>=', eb.ref('due_to_event_time_comparisons.duration')),
              ]),
              eb.and([
                eb('due_to_event_time_comparisons.comparator', '=', '<='),
                eb('patient_events.comparator', 'in', ['=', '<', '<=']),
                eb(actual_duration, '<=', eb.ref('due_to_event_time_comparisons.duration')),
              ]),
            ])
          }))
      .$if(!!explicit, (qb) =>
        qb
          .where('specific_descendants.descendant_id', '=', snomedConceptBase(trx, explicit!.specific_snomed_concept))
          // root is null when the subject was an active_condition
          .where((eb) =>
            eb.or([
              eb('due_to_event_time_comparisons.root_snomed_concept_id', 'is', null),
              eb('due_to_event_time_comparisons.root_snomed_concept_id', '=', snomedConceptBase(trx, explicit!.root_snomed_concept)),
            ])
          )
          /*
            An event attribute of the node carries an exact datetime, i.e. comparator '=', which
            can satisfy either direction. The finding has not been entered, so how long ago the
            event was is measured from now() rather than from patient_records.created_at.
          */
          .where((eb) =>
            eb.or(explicit_events.map((event) => {
              const actual_duration = sql<IPostgresInterval>`now() - ${event.datetime}::timestamptz`
              return eb.and([
                eb.exists(
                  descendsFrom(trx, {
                    ancestor: eb.ref('due_to_event_time_comparisons.event_snomed_concept_id'),
                    descendant: snomedConceptBase(trx, event.specific_snomed_concept),
                  }),
                ),
                eb.or([
                  eb.and([
                    eb('due_to_event_time_comparisons.comparator', '=', '>='),
                    eb(actual_duration, '>=', eb.ref('due_to_event_time_comparisons.duration')),
                  ]),
                  eb.and([
                    eb('due_to_event_time_comparisons.comparator', '=', '<='),
                    eb(actual_duration, '<=', eb.ref('due_to_event_time_comparisons.duration')),
                  ]),
                ]),
              ])
            }))
          ))
      .select([
        literalString('event_time_comparison' as DueToMatchType).as('type'),
        'due_to.id as due_to_id',
        patient_record_id,
        'due_to.s_expression',
        'due_to.history',
      ])

    return trx.with('matching_due_tos', () =>
      by_findings_query
        .unionAll(by_finding_sites_query)
        .unionAll(by_measurements_query)
        .unionAll(by_event_time_comparisons_query)).selectFrom('matching_due_tos')
      .selectAll('matching_due_tos')
  },

  formatResult: identity,

  /*
    Read-only counterpart of determineFromNewRecords for a finding that has not been
    inserted: baseQuery's explicit case matches the node's own concepts, qualifiers and
    attributes against the due_to tables in place of patient_records.
  */
  forHypotheticalFinding(
    trx: TrxOrDbOrQueryCreator,
    { patient_age_determination, finding }: {
      patient_age_determination: AgeDetermination
      finding: InsertableFindingBase
    },
  ): Promise<HypotheticalDueToMatch[]> {
    if (finding.existence !== 'Yes') return Promise.resolve([])

    return due_to.findAll(trx, {
      patient_age_determination,
      positive_records: { type: 'explicit', finding },
    })
  },

  async determineFromNewRecords(
    trx: TrxOrDbOrQueryCreator,
    new_records: NewRecordsToConsider,
  ): Promise<string | NewRecordsToConsiderWithSatisfyingDueToIds> {
    const { patient_id, patient_encounter_id, patient_age_determination, records } = new_records
    if (!patient_age_determination) return 'Skipped: patient age determination is unknown'

    const positive_record_ids = records
      .filter((r) => r.existence === 'Yes')
      .map((r) => r.id)

    if (arrayIsEmpty(positive_record_ids)) return 'Skipped: no positive findings to check'

    const to_insert: {
      s_expression: string
      type: DueToMatchType
      patient_record_id: string
      due_to_id: string
    }[] = await due_to.findAll(trx, {
      patient_id,
      patient_age_determination,
      positive_records: { type: 'by_id', ids: positive_record_ids },
    })

    if (!to_insert.length) {
      return 'No due_to matched'
    }

    const inserted = await trx.insertInto('patient_record_satisfying_due_tos')
      .values(to_insert.map(pick(['due_to_id', 'patient_record_id'])))
      .returning([
        'id as patient_record_satisfying_due_to_id',
        'patient_record_id',
      ])
      .execute()

    const records_with_satisfying_due_to_ids = new_records.records.map((record) => {
      const satisfying_due_to_ids = inserted
        .filter((satisfying_due_to) => satisfying_due_to.patient_record_id === record.id)
        .map((satisfying_due_to) => satisfying_due_to.patient_record_satisfying_due_to_id)

      return { ...record, satisfying_due_to_ids }
    })

    return { ...new_records, patient_age_determination, records: records_with_satisfying_due_to_ids }
  },

  async addFromNewRecords(
    trx: TrxOrDbOrQueryCreator,
    new_records: NewRecordsToConsider,
  ): Promise<string> {
    const new_records_with_satisfying_due_to_ids = await due_to.determineFromNewRecords(trx, new_records)

    if (isString(new_records_with_satisfying_due_to_ids)) {
      // Even when no positive findings matched due_tos, if we have a procedure_id we still
      // need to emit RecordDueTosTagged so insertImprobableDiagnoses can run and downgrade
      // any possible diagnoses whose check_for tasks are now all answered "No".
      const { procedure_id, patient_id, patient_encounter_id, patient_age_determination, records } = new_records
      if (procedure_id && patient_age_determination) {
        await events.insert(trx, {
          type: 'RecordDueTosTagged',
          data: {
            procedure_id,
            patient_id,
            patient_encounter_id,
            patient_age_determination,
            records: records.map((r) => ({ ...r, satisfying_due_to_ids: [] })),
          },
        })
      }
      return new_records_with_satisfying_due_to_ids
    }

    await events.insert(trx, {
      type: 'RecordDueTosTagged',
      data: new_records_with_satisfying_due_to_ids,
    })

    return `Inserted ${new_records_with_satisfying_due_to_ids.records.flatMap((item) => item.satisfying_due_to_ids)}`
  },
})
