import { sql } from 'kysely'
import { AgeDetermination, NewRecordsToConsider, NewRecordsToConsiderWithSatisfyingDueToIds, TrxOrDbOrQueryCreator } from '../../types.ts'
import { literalBoolean, literalString } from '../helpers.ts'
import { FINDING_SITE } from '../../shared/snomed_concepts.ts'
import { parseWithSchema } from '../../shared/s_expression.ts'
import { any_query_single } from '../../shared/s_expression_schemas.ts'
import partition from '../../util/partition.ts'
import { base, identity } from './_base.ts'
import { arrayIsEmpty } from '../../util/arraySize.ts'
import { assert } from 'std/assert/assert.ts'
import pick from '../../util/pick.ts'
import { pMap } from '../../util/inParallel.ts'
import { buildExpression } from './s_expression.ts'
import compact from '../../util/compact.ts'
import { events } from './events.ts'
import isString from '../../util/isString.ts'

type DueToMatchType = 'finding' | 'measurement' | 'finding_site' | 'event_time_comparison'

export const due_to = base({
  top_level_table: 'due_to',
  baseQuery(trx: TrxOrDbOrQueryCreator, {
    // patient_id,
    patient_age_determination,
    positive_record_ids,
  }: {
    patient_id: string
    patient_age_determination: AgeDetermination
    positive_record_ids: string[]
  }) {
    assert(positive_record_ids.length)

    const by_findings_query = trx.selectFrom('due_to_findings')
      .innerJoin('due_to', 'due_to_findings.id', 'due_to.id')
      .innerJoin(
        'snomed_concept_active_descendants_realized as specific_descendants',
        'specific_descendants.ancestor_id',
        'due_to_findings.specific_snomed_concept_id',
      )
      .innerJoin('patient_records', 'patient_records.specific_snomed_concept_id', 'specific_descendants.descendant_id')
      .innerJoin('patient_records_still_valid', 'patient_records_still_valid.id', 'patient_records.id')
      .whereRef('patient_records.root_snomed_concept_id', '=', 'due_to_findings.root_snomed_concept_id')
      .where('due_to.age_determinations', '@>', sql<AgeDetermination[]>`ARRAY[${patient_age_determination}]::age_determination[]`)
      .where('patient_records.id', 'in', positive_record_ids)
      .where((eb) =>
        eb.or([
          eb('due_to_findings.value_snomed_concept_id', 'is', null),
          eb.exists(
            eb.selectFrom('snomed_concept_active_descendants_realized as value_descendants')
              .whereRef('value_descendants.ancestor_id', '=', 'due_to_findings.value_snomed_concept_id')
              .whereRef('value_descendants.descendant_id', '=', 'patient_records.value_snomed_concept_id'),
          ),
        ])
      )
      .select([
        literalString('finding' as DueToMatchType).as('type'),
        'due_to.id as due_to_id',
        'patient_records.id as patient_record_id',
        's_expression',
        'is_somehow_qualified',
      ])

    const by_finding_sites_query = trx.selectFrom('due_to_finding_sites')
      .innerJoin('due_to', 'due_to.id', 'due_to_finding_sites.id')
      .innerJoin('patient_records', (join) => join.onTrue())
      .innerJoin('patient_records_still_valid', 'patient_records_still_valid.id', 'patient_records.id')
      .where('due_to.age_determinations', '@>', sql<AgeDetermination[]>`ARRAY[${patient_age_determination}]::age_determination[]`)
      .where('patient_records.id', 'in', positive_record_ids)
      .where((eb) =>
        eb.or([
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
          eb.exists(
            trx.selectFrom('snomed_relationship')
              .where('snomed_relationship.active', '=', true)
              .where(
                'snomed_relationship.type_id',
                '=',
                FINDING_SITE.id,
              )
              .where(
                'snomed_relationship.source_id',
                '=',
                eb.ref('patient_records.specific_snomed_concept_id'),
              )
              .innerJoin(
                'snomed_concept_active_descendants_realized as dest_descendants',
                (join) =>
                  join
                    .onRef('dest_descendants.descendant_id', '=', 'snomed_relationship.destination_id')
                    .on('dest_descendants.ancestor_id', '=', eb.ref('due_to_finding_sites.value_snomed_concept_id')),
              ),
          ),
        ])
      )
      .select([
        literalString('finding_site' as DueToMatchType).as('type'),
        'due_to.id as due_to_id',
        'patient_records.id as patient_record_id',
        's_expression',
        'is_somehow_qualified',
      ])

    const by_measurements_query = trx.selectFrom('due_to_measurements')
      .innerJoin('due_to', 'due_to.id', 'due_to_measurements.id')
      .innerJoin('patient_records', 'patient_records.specific_snomed_concept_id', 'due_to_measurements.specific_snomed_concept_id')
      .innerJoin('patient_records_still_valid', 'patient_records_still_valid.id', 'patient_records.id')
      .innerJoin('patient_measurements', 'patient_records.id', 'patient_measurements.id')
      .where('due_to.age_determinations', '@>', sql<AgeDetermination[]>`ARRAY[${patient_age_determination}]::age_determination[]`)
      .where('patient_records.id', 'in', positive_record_ids)
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
      )
      .select([
        literalString('measurement' as DueToMatchType).as('type'),
        'due_to.id as due_to_id',
        'patient_records.id as patient_record_id',
        's_expression',
        literalBoolean(false).as('is_somehow_qualified'),
      ])

    // Candidate match on the subject concept only. The comparator/duration are
    // evaluated by re-running the s_expression through buildExpression (the
    // is_somehow_qualified path), which encodes the time-ago guarantee logic.
    const by_event_time_comparisons_query = trx.selectFrom('due_to_event_time_comparisons')
      .innerJoin('due_to', 'due_to.id', 'due_to_event_time_comparisons.id')
      .innerJoin(
        'snomed_concept_active_descendants_realized as specific_descendants',
        'specific_descendants.ancestor_id',
        'due_to_event_time_comparisons.specific_snomed_concept_id',
      )
      .innerJoin('patient_records', 'patient_records.specific_snomed_concept_id', 'specific_descendants.descendant_id')
      .innerJoin('patient_records_still_valid', 'patient_records_still_valid.id', 'patient_records.id')
      .where('due_to.age_determinations', '@>', sql<AgeDetermination[]>`ARRAY[${patient_age_determination}]::age_determination[]`)
      .where('patient_records.id', 'in', positive_record_ids)
      // root is null when the subject was an active_condition
      .where((eb) =>
        eb.or([
          eb('due_to_event_time_comparisons.root_snomed_concept_id', 'is', null),
          eb('patient_records.root_snomed_concept_id', '=', eb.ref('due_to_event_time_comparisons.root_snomed_concept_id')),
        ])
      )
      .select([
        literalString('event_time_comparison' as DueToMatchType).as('type'),
        'due_to.id as due_to_id',
        'patient_records.id as patient_record_id',
        's_expression',
        literalBoolean(true).as('is_somehow_qualified'),
      ])

    return trx.with('matching_due_tos', () =>
      by_findings_query
        .unionAll(by_finding_sites_query)
        .unionAll(by_measurements_query)
        .unionAll(by_event_time_comparisons_query)).selectFrom('matching_due_tos')
      .selectAll('matching_due_tos')
  },

  formatResult: identity,

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

    const due_to_matching_records: {
      s_expression: string
      is_somehow_qualified: boolean
      type: DueToMatchType
      patient_record_id: string
      due_to_id: string
    }[] = await due_to.findAll(trx, {
      patient_id,
      patient_age_determination,
      positive_record_ids,
    })

    const [is_somehow_qualified, unqualified] = partition(due_to_matching_records, (due_to_matching_record) => due_to_matching_record.is_somehow_qualified)

    const matches_qualifiers = await pMap(is_somehow_qualified, async (due_to_matching_record) => {
      const node = parseWithSchema(due_to_matching_record.s_expression, any_query_single)
      const matches = await buildExpression(
        trx,
        { patient_id, patient_encounter_id },
        node,
      ).where('patient_records_aggregated.id', '=', due_to_matching_record.patient_record_id)
        .executeTakeFirst()

      if (matches) {
        return due_to_matching_record
      }
    }).then(compact)

    const to_insert = [...matches_qualifiers, ...unqualified]

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
