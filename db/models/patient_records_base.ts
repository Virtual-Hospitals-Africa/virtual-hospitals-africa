import { Selecting, TrxOrDb, TrxOrDbOrQueryCreator } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import {
  asText,
  jsonBuildNullableObject,
  jsonBuildObject,
  literalString,
  success_true,
} from '../helpers.ts'
import {
  ALTERED,
  ENTERED_IN_ERROR,
  EVALUATION_ACTION,
} from '../../shared/snomed_concepts.ts'

export const RECORD_NOW_INVALID = {
  ALTERED,
  ENTERED_IN_ERROR,
}

function markInvalid(
  trx: TrxOrDb,
  {
    patient_id,
    patient_encounter_id,
    employment_id,
    procedure_id,
    altered_record_id,
    snomed_concept,
  }: {
    patient_id: string
    patient_encounter_id: string
    employment_id: string
    procedure_id: string
    altered_record_id: string
    snomed_concept: keyof typeof RECORD_NOW_INVALID
  },
) {
  const id = generateUUID()

  return trx.with('inserting_record', (qb) =>
    qb.insertInto('patient_records')
      .values({
        id,
        patient_id,
        patient_encounter_id,
        root_snomed_concept_id: EVALUATION_ACTION.id,
        specific_snomed_concept_id: RECORD_NOW_INVALID[snomed_concept].id,
      }).returning('id')
    ).with(
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
    snomed_concept: 'ALTERED',
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
    snomed_concept: 'ENTERED_IN_ERROR',
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
      'now_invalid_patient_records.specific_snomed_concept_id',
      'in',
      [ALTERED.id, ENTERED_IN_ERROR.id],
    )
    .select('now_invalid_patient_evaluations.evaluates_record_id')
}

export type IntermediateBaseRecord = Selecting<
  ReturnType<typeof nonGroupedBaseQuery>
>

export function nonGroupedBaseQuery(
  trx: TrxOrDbOrQueryCreator,
) {
  return trx.selectFrom('patient_records')
    .innerJoin(
      'snomed_inferred_canonical_name_and_category as root_snomed_concept',
      'patient_records.root_snomed_concept_id',
      'root_snomed_concept.id',
    )
    .innerJoin(
      'snomed_inferred_canonical_name_and_category as specific_snomed_concept',
      'patient_records.specific_snomed_concept_id',
      'specific_snomed_concept.id',
    )
    .leftJoin(
      'snomed_inferred_canonical_name_and_category as value_snomed_concept',
      'patient_records.value_snomed_concept_id',
      'value_snomed_concept.id',
    )
    .leftJoin(
      'patient_events as maybe_events',
      'patient_records.id',
      'maybe_events.id',
    )
    .leftJoin(
      'patient_measurements as maybe_measurements',
      'patient_records.id',
      'maybe_measurements.id',
    )
    .leftJoin(
      'patient_evaluation_scores as maybe_scores',
      'patient_records.id',
      'maybe_scores.id',
    )
    .leftJoin(
      'patient_record_s_expressions as maybe_s_expressions',
      'patient_records.id',
      'maybe_s_expressions.id',
    )
    .select((eb) => [
      'patient_records.id as record_id',
      'patient_records.created_at',
      'patient_records.patient_encounter_id',
      jsonBuildObject({
        snomed_concept_id: asText(
          eb,
          'root_snomed_concept.id',
        ),
        name: eb.ref('root_snomed_concept.name'),
        category: eb.ref(
          'root_snomed_concept.category',
        ),
      }).as('root_snomed_concept'),

      jsonBuildObject({
        snomed_concept_id: asText(
          eb,
          'specific_snomed_concept.id',
        ),
        name: eb.ref('specific_snomed_concept.name'),
        category: eb.ref(
          'specific_snomed_concept.category',
        ),
      }).as('specific_snomed_concept'),

      eb.fn.coalesce(
        jsonBuildNullableObject(
          eb.ref('patient_records.value_snomed_concept_id'),
          {
            type: literalString('snomed_concept' as const),
            snomed_concept_id: asText(
              eb,
              'value_snomed_concept.id',
            ).$notNull(),
            name: eb.ref(
              'value_snomed_concept.name',
            )
              .$notNull(),
            category: eb.ref(
              'value_snomed_concept.category',
            ).$notNull(),
          },
        ),
        jsonBuildNullableObject(
          eb.ref('maybe_events.id'),
          {
            type: literalString('event' as const),
            datetime: eb.ref('maybe_events.datetime').$notNull(),
          },
        ),
        jsonBuildNullableObject(
          eb.ref('maybe_measurements.id'),
          {
            type: literalString('measurement' as const),
            value: asText(eb, 'maybe_measurements.value').$notNull(),
            units: eb.ref('maybe_measurements.units').$notNull(),
          },
        ),
        jsonBuildNullableObject(
          eb.ref('maybe_scores.id'),
          {
            type: literalString('score' as const),
            score: asText(eb, 'maybe_scores.score').$notNull(),
          },
        ),
        jsonBuildNullableObject(
          eb.ref('maybe_s_expressions.id'),
          {
            type: literalString('s_expression' as const),
            s_expression: asText(eb, 'maybe_s_expressions.s_expression')
              .$notNull(),
          },
        ),
      ).as('value'),
    ])
    .where(
      'patient_records.id',
      'not in',
      nowInvalidRecords(trx),
    )
}
