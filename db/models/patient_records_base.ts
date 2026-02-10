import { Selecting, TrxOrDb, TrxOrDbOrQueryCreator } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { asText, success_true } from '../helpers.ts'
import { ALTERED, ENTERED_IN_ERROR, EVALUATION_ACTION } from '../../shared/snomed_concepts.ts'
import { inBackground } from '../../util/inBackground.ts'
import { events } from './events.ts'
import zip from '../../util/zip.ts'

export const RECORD_NOW_INVALID = {
  ALTERED,
  ENTERED_IN_ERROR,
}

function markInvalid(
  trx: TrxOrDb,
  input: {
    patient_id: string
    patient_encounter_id: string
    employment_id: string
    procedure_id: string
    altered_record_ids: string[]
    snomed_concept: keyof typeof RECORD_NOW_INVALID
  },
) {
  const {
    patient_id,
    patient_encounter_id,
    employment_id,
    procedure_id,
    altered_record_ids,
    snomed_concept,
  } = input

  if (!altered_record_ids.length) return

  const records = altered_record_ids.map(() => ({
    id: generateUUID(),
    patient_id,
    patient_encounter_id,
    root_snomed_concept_id: EVALUATION_ACTION.id,
    specific_snomed_concept_id: RECORD_NOW_INVALID[snomed_concept].id,
  }))
  const evaluations = zip(altered_record_ids, records).map(([altered_record_id, { id }]) => ({
    id,
    employment_id,
    procedure_id,
    evaluates_record_id: altered_record_id,
    by_system: false,
  })).toArray()

  return inBackground(
    events.insert(trx, {
      type: 'RecordMarkedInvalid',
      data: input,
    }),
    () =>
      trx.with('inserting_record', (qb) =>
        qb.insertInto('patient_records')
          .values(records).returning('id')).with(
          'inserting_evaluation',
          (qb) =>
            qb.insertInto('patient_evaluations')
              .values(evaluations),
        ).selectNoFrom(success_true)
        .executeTakeFirstOrThrow(),
  )
}

export function markAltered(
  trx: TrxOrDb,
  opts: {
    patient_id: string
    patient_encounter_id: string
    employment_id: string
    procedure_id: string
    altered_record_ids: string[]
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
    altered_record_ids: string[]
  },
) {
  return markInvalid(trx, {
    ...opts,
    snomed_concept: 'ENTERED_IN_ERROR',
  })
}

export type IntermediateBaseRecord = Selecting<
  ReturnType<typeof nonGroupedBaseQuery>
>

export function nonGroupedBaseQuery(
  trx: TrxOrDbOrQueryCreator,
) {
  return trx.selectFrom('patient_records_aggregated')
    .innerJoin('patient_records_still_valid', 'patient_records_still_valid.id', 'patient_records_aggregated.id')
    .select((eb) => [
      'patient_records_aggregated.id',
      'patient_records_aggregated.created_at',
      'patient_records_aggregated.patient_id',
      'patient_records_aggregated.patient_encounter_id',
      asText(eb, 'patient_records_aggregated.root_snomed_concept_id').as('root_snomed_concept_id'),
      'patient_records_aggregated.root_snomed_concept_name',
      'patient_records_aggregated.root_snomed_concept_category',
      asText(eb, 'patient_records_aggregated.specific_snomed_concept_id').as('specific_snomed_concept_id'),
      'patient_records_aggregated.specific_snomed_concept_name',
      'patient_records_aggregated.specific_snomed_concept_category',
      'patient_records_aggregated.existence',
      'patient_records_aggregated.value',
    ])
}
