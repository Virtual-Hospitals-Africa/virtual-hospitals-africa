import { Selecting, TrxOrDb, TrxOrDbOrQueryCreator } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { asText, success_true } from '../helpers.ts'
import { ALTERED, ENTERED_IN_ERROR, EVALUATION_ACTION } from '../../shared/snomed_concepts.ts'

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
      }).returning('id')).with(
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
