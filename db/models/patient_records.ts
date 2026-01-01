import { IdSelection, TrxOrDb, TrxOrDbOrQueryCreator } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { asText, jsonArrayFrom, jsonBuildNullableObject, jsonBuildObject, literalString, success_true } from '../helpers.ts'
import { base } from './_base.ts'
import * as patient_record_qualifiers from './patient_record_qualifiers.ts'
import {
  buildExpression,
  maybeSnomedConceptBase,
  snomedConceptBase,
} from './s_expression.ts'
import { assert } from 'std/assert/assert.ts'
import { AnyNode, Lang, snomed_concept } from '../../shared/s_expression_schemas.ts'
import assertHasProperty from '../../util/assertHasProperty.ts'
import { formatRecordDisplay } from '../../shared/patient_records.ts'

export const ALTERED_SNOMED_CONCEPT_ID = '18307000' as const
export const ENTERED_IN_ERROR_SNOMED_CONCEPT_ID = '723510000' as const
export const RECORD_NOW_INVALID_CONCEPT_ID = [
  ALTERED_SNOMED_CONCEPT_ID,
  ENTERED_IN_ERROR_SNOMED_CONCEPT_ID,
]

export type RecordNowInvalidConceptId =
  (typeof RECORD_NOW_INVALID_CONCEPT_ID)[number]

function markInvalid(
  trx: TrxOrDb,
  {
    patient_id,
    patient_encounter_id,
    employment_id,
    procedure_id,
    altered_record_id,
    snomed_concept_id,
  }: {
    patient_id: string
    patient_encounter_id: string
    employment_id: string
    procedure_id: string
    altered_record_id: string
    snomed_concept_id: RecordNowInvalidConceptId
  },
) {
  const id = generateUUID()

  return trx.with('inserting_record', (qb) =>
    qb.insertInto('patient_records')
      .values({
        id,
        patient_id,
        patient_encounter_id,
        snomed_concept_id,
      })).with(
      'inserting_evaluation',
      (qb) =>
        qb.insertInto('patient_evaluations')
          .values({
            id,
            employment_id,
            procedure_id,
            evaluates_record_id: altered_record_id,
            by_system: false,
          }),
    ).selectNoFrom(success_true)
    .executeTakeFirstOrThrow()
}

export function markAltered(
  trx: TrxOrDb,
  opts: {
    patient_id: string
    patient_encounter_id: string
    employment_id: string
    procedure_id: string
    altered_record_id: string
  },
) {
  return markInvalid(trx, {
    ...opts,
    snomed_concept_id: ALTERED_SNOMED_CONCEPT_ID,
  })
}

export function markEnteredInError(
  trx: TrxOrDb,
  opts: {
    patient_id: string
    patient_encounter_id: string
    employment_id: string
    procedure_id: string
    altered_record_id: string
  },
) {
  return markInvalid(trx, {
    ...opts,
    snomed_concept_id: ENTERED_IN_ERROR_SNOMED_CONCEPT_ID,
  })
}

export function nowInvalidRecords(
  trx: TrxOrDbOrQueryCreator,
) {
  return trx.selectFrom(
    'patient_records as now_invalid_patient_records',
  )
    .innerJoin(
      'patient_evaluations as now_invalid_patient_evaluations',
      'now_invalid_patient_evaluations.id',
      'now_invalid_patient_records.id',
    )
    .where(
      'now_invalid_patient_records.snomed_concept_id',
      'in',
      RECORD_NOW_INVALID_CONCEPT_ID,
    )
    .select('now_invalid_patient_evaluations.evaluates_record_id')
}

export function baseQuery(
  trx: TrxOrDbOrQueryCreator,
) {
  return trx.selectFrom('patient_records')
    .innerJoin(
      'snomed_inferred_canonical_name_and_category',
      'patient_records.snomed_concept_id',
      'snomed_inferred_canonical_name_and_category.id',
    )
    .leftJoin(
      'snomed_inferred_canonical_name_and_category as value_snomed_inferred_canonical_name_and_category',
      'patient_records.value_snomed_concept_id',
      'value_snomed_inferred_canonical_name_and_category.id',
    )
    .select((eb) => [
      'patient_records.id as record_id',
      'patient_records.created_at',
      'patient_records.patient_encounter_id',

      jsonBuildObject({
        snomed_concept_id: asText(eb, 'snomed_inferred_canonical_name_and_category.id'),
        name: eb.ref('snomed_inferred_canonical_name_and_category.name'),
        category: eb.ref('snomed_inferred_canonical_name_and_category.category'),
      }).as('root_snomed_concept'),

      jsonBuildNullableObject(
        eb.ref('patient_records.value_snomed_concept_id'), {
          type: literalString('snomed_concept' as const),
          snomed_concept: jsonBuildObject({
            snomed_concept_id: eb.ref('value_snomed_inferred_canonical_name_and_category.id').$notNull(),
            name: eb.ref('value_snomed_inferred_canonical_name_and_category.name').$notNull(),
            category: eb.ref('value_snomed_inferred_canonical_name_and_category.category').$notNull(),
          })
        }
      ).as('value_snomed_concept'),

      jsonArrayFrom(
        eb.selectFrom('patient_record_relations')
          .innerJoin(
            'patient_records as relation_records',
            'relation_records.id',
            'patient_record_relations.id',
          )
          .whereRef(
            'patient_record_relations.source_id',
            '=',
            'patient_records.id',
          )
          .select((eb_destination) => [
            'patient_record_relations.destination_id',
            asText(eb_destination, 'relation_records.snomed_concept_id').as(
              'snomed_concept_id',
            ),
          ]),
      ).as('destination_relations'),

      jsonArrayFrom(
        eb.selectFrom('patient_record_relations')
          .innerJoin(
            'patient_records as relation_records',
            'relation_records.id',
            'patient_record_relations.id',
          )
          .whereRef(
            'patient_record_relations.destination_id',
            '=',
            'patient_records.id',
          )
          .select((eb_source) => [
            'patient_record_relations.source_id',
            asText(eb_source, 'relation_records.snomed_concept_id').as(
              'snomed_concept_id',
            ),
          ]),
      ).as('source_relations'),
      jsonArrayFrom(
        patient_record_qualifiers.baseQueryPrefix(trx)
          .where(
            'patient_record_qualifiers.qualifies_record_id',
            '=',
            eb.ref('patient_records.id'),
          ),
      ).as('prefixes'),
      jsonArrayFrom(
        patient_record_qualifiers.baseQueryAttributeSnomedConcept(trx)
          .where(
            'patient_record_qualifiers.qualifies_record_id',
            '=',
            eb.ref('patient_records.id'),
          ),
      ).as('attributes'),
      jsonArrayFrom(
        patient_record_qualifiers.baseQueryAttributeEvent(trx)
          .where(
            'patient_record_qualifiers.qualifies_record_id',
            '=',
            eb.ref('patient_records.id'),
          ),
      ).as('events'),
      // Aliased base query idea
      // https://github.com/Virtual-Hospitals-Africa/virtual-hospitals-africa/blob/a94d120fc459824516c14931ea2f8b4abcf27d9b/db/models/patient_record_qualifiers.ts
      // jsonArrayFrom(
      //   patient_record_qualifiers.baseQuery(trx, 'qualifiers_1' as const)
      //     .where(
      //       'qualifiers_1.qualifies_record_id',
      //       '=',
      //       eb.ref('patient_records.id'),
      //     )
      //     .select((eb_qualifiers1) => [
      //       jsonArrayFrom(
      //         patient_record_qualifiers.baseQuery(trx, 'qualifiers_2' as const)
      //           .where(
      //             'qualifiers_2.qualifies_record_id',
      //             '=',
      //             eb_qualifiers1.ref('qualifiers_1.record_id'),
      //           )
      //           .select((_eb_qualifiers2) => [
      //             // At max depth, just return an empty array
      //             sql<
      //               RenderedQualifierRelativeToHealthWorker[]
      //             >`ARRAY[]::int[]`.as(
      //               'qualifiers',
      //             ),
      //           ]),
      //       ).as('qualifiers'),
      //     ]),
      // ).as('qualifiers'),
    ])
    .where(
      'patient_records.id',
      'not in',
      nowInvalidRecords(trx),
    )
}

type RecordInsert = {
  patient_id: string
  patient_encounter_id: string
  record_id?: string
  snomed_concept: Lang['snomed_concept']
  value_snomed_concept: Lang['snomed_concept'] | null
  qualifiers?: Lang['qualifier'][]
  attributes?: Lang['attribute'][]
}

export function baseInsert(
  trx: TrxOrDb,
  insert: RecordInsert,
) {
  console.log('zz', insert)
  const {
    patient_id,
    patient_encounter_id,
    record_id = generateUUID(),
    snomed_concept,
    value_snomed_concept,
    qualifiers = [],
  } = insert

  let query = trx.with(
    'inserting_records',
    (qb) =>
      qb.insertInto('patient_records')
        .values({
          id: record_id,
          patient_id,
          patient_encounter_id,
          snomed_concept_id: snomedConceptBase(trx, snomed_concept),
          value_snomed_concept_id: maybeSnomedConceptBase(
            trx,
            value_snomed_concept,
          ),
        }),
  )

  function qualifierCte(
    qb: typeof query,
    qualifier: Lang['qualifier'],
    qualifies_record_id: string,
  ) {
    assertHasProperty(qualifier, 'snomed_concept')
    const qualifier_id = generateUUID()
    const id_token = qualifier_id.replaceAll('-', '_')

    let next_query = qb.with(
      `inserting_qualifier_record_${id_token}`,
      (qb) =>
        qb.insertInto('patient_records')
          .values({
            id: qualifier_id,
            patient_id,
            patient_encounter_id,
            snomed_concept_id: snomedConceptBase(
              trx,
              qualifier.snomed_concept,
            ),
            value_snomed_concept_id: maybeSnomedConceptBase(
              trx,
              qualifier.value_snomed_concept,
            ),
          }),
    ).with(
      `inserting_qualifiers_${id_token}`,
      (qb) =>
        qb.insertInto('patient_record_qualifiers')
          .values({
            id: qualifier_id,
            qualifies_record_id,
          }),
    ) as unknown as typeof query

    for (const sub_qualifier of qualifier.qualifiers) {
      next_query = qualifierCte(
        next_query,
        sub_qualifier,
        qualifier_id,
      ) as unknown as typeof query
    }

    return next_query
  }

  for (const qualifier of qualifiers) {
    query = qualifierCte(query, qualifier, record_id)
  }

  return query
}

type PatientRecordsSearch = {
  patient_id: string | IdSelection
  patient_encounter_id?: string | IdSelection
  s_expression?: string | AnyNode
  search?: string
}

export const patient_records = base({
  top_level_table: 'patient_records',
  baseQuery,
  formatResult: (intermediate_record) => {

    return formatRecordDisplay(intermediate_record)
  },
  baseInsert,
  handleSearch(
    qb,
    opts: PatientRecordsSearch,
    trx,
  ) {
    assert(!opts.search, 'TODO support')
    assert(
      opts.patient_id,
      'For now, you must always provide a patient_id as part of a query',
    )
    // if (opts.search) {
    //   qb = qb.where(
    //     'snomed_inferred_canonical_name_and_category.name',
    //     'ilike',
    //     `%${opts.search}%`,
    //   )
    // }
    if (opts.patient_id) {
      qb = qb.where(
        'patient_records.patient_id',
        '=',
        opts.patient_id,
      )
    }
    if (opts.patient_encounter_id) {
      qb = qb.where(
        'patient_records.patient_encounter_id',
        '=',
        opts.patient_encounter_id,
      )
    }
    if (opts.s_expression) {
      qb = qb.where(
        'patient_records.id',
        'in',
        buildExpression(
          trx,
          {
            patient_id: opts.patient_id,
            patient_encounter_id: opts.patient_encounter_id,
          },
          opts.s_expression,
        ),
      )
    }

    return qb
  },
})
