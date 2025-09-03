import { TrxOrDb } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { success_true } from '../helpers.ts'

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
    encounter_id,
    encounter_provider_id,
    altered_record_id,
    snomed_concept_id,
  }: {
    patient_id: string
    encounter_id: string
    encounter_provider_id: string
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
        encounter_id,
        snomed_concept_id,
      })).with(
      'inserting_evaluation',
      (qb) =>
        qb.insertInto('patient_evaluations')
          .values({
            id,
            encounter_provider_id,
            evaluates_record_id: altered_record_id,
          }),
    ).selectNoFrom(success_true)
    .executeTakeFirstOrThrow()
}

export function markAltered(
  trx: TrxOrDb,
  opts: {
    patient_id: string
    encounter_id: string
    encounter_provider_id: string
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
    encounter_id: string
    encounter_provider_id: string
    altered_record_id: string
  },
) {
  return markInvalid(trx, {
    ...opts,
    snomed_concept_id: ENTERED_IN_ERROR_SNOMED_CONCEPT_ID,
  })
}
