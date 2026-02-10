import { Maybe, Selecting, TrxOrDb, TrxOrDbOrQueryCreator } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { asText, success_true } from '../helpers.ts'
import { ALTERED, DIAGNOSIS, ENTERED_IN_ERROR, EVALUATION_ACTION, EVIDENCE_OF_CONTEXTUAL_QUALIFIER } from '../../shared/snomed_concepts.ts'

import zip from '../../util/zip.ts'
import { patient_evaluations } from './patient_evaluations.ts'
import { sql } from 'kysely'

export const RECORD_NOW_INVALID = {
  ALTERED,
  ENTERED_IN_ERROR,
}

type MarkInvalidSharedOpts =
  & {
    patient_id: string
    patient_encounter_id: string
    procedure_id?: Maybe<string>
    altered_record_ids: string[]
  }
  & ({
    employment_id: string
    by_system?: never
  } | {
    employment_id?: never
    by_system: true
  })

function markInvalid(
  trx: TrxOrDb,
  input: MarkInvalidSharedOpts & {
    snomed_concept: keyof typeof RECORD_NOW_INVALID
  },
) {
  const {
    patient_id,
    patient_encounter_id,
    employment_id,
    by_system,
    procedure_id,
    altered_record_ids,
    snomed_concept,
  } = input

  if (!altered_record_ids.length) {
    return Promise.resolve({
      success: true,
      vacuous: true,
    })
  }

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
    by_system: by_system || false,
  })).toArray()

  return trx.with('affected_diagnoses', () =>
    patient_evaluations.distinctIds(
      trx,
      {
        patient_id,
        patient_encounter_id,
        root_snomed_concept_id: DIAGNOSIS.id,
      },
    ).where(
      'patient_evaluations.id',
      'in',
      trx
        .selectFrom('patient_record_relations')
        .innerJoin('patient_records', 'patient_records.id', 'patient_record_relations.id')
        .where('patient_record_relations.destination_id', 'in', altered_record_ids)
        .where('patient_records.specific_snomed_concept_id', '=', EVIDENCE_OF_CONTEXTUAL_QUALIFIER.id)
        .select('patient_record_relations.source_id as diagnosis_id')
        .distinct(),
    )
      .select([
        sql`gen_random_uuid()`.as('invalid_diagnosis_id'),
      ]))
    .with('inserting_altered_diagnosis_records', (qb) =>
      qb.insertInto('patient_records')
        .columns(['id', 'patient_id', 'patient_encounter_id', 'root_snomed_concept_id', 'specific_snomed_concept_id'])
        .expression(
          qb.selectFrom('affected_diagnoses')
            .select([
              'affected_diagnoses.invalid_diagnosis_id as id',
              sql.lit(patient_id).as('patient_id'),
              sql.lit(patient_encounter_id).as('patient_encounter_id'),
              sql.lit(EVALUATION_ACTION.id).as('root_snomed_concept_id'),
              sql.lit(ALTERED.id).as('specific_snomed_concept_id'),
            ]),
        ))
    .with('inserting_altered_diagnosis_evaluations', (qb) =>
      qb.insertInto('patient_evaluations')
        .columns(['id', 'employment_id', 'procedure_id', 'evaluates_record_id', 'by_system'])
        .expression(
          qb.selectFrom('affected_diagnoses')
            .select([
              'affected_diagnoses.invalid_diagnosis_id as id',
              sql.lit(employment_id ?? null).as('employment_id'),
              sql.lit(procedure_id ?? null).as('procedure_id'),
              'affected_diagnoses.id as evaluates_record_id',
              sql.lit(by_system || false).as('by_system'),
            ]),
        ))
    .with('inserting_records', (qb) =>
      qb.insertInto('patient_records')
        .values(records).returning('id')).with(
      'inserting_evaluations',
      (qb) =>
        qb.insertInto('patient_evaluations')
          .values(evaluations),
    ).selectNoFrom(success_true)
    .executeTakeFirstOrThrow()
}

export function markAltered(
  trx: TrxOrDb,
  opts: MarkInvalidSharedOpts,
) {
  return markInvalid(trx, {
    ...opts,
    snomed_concept: 'ALTERED',
  })
}

export function markEnteredInError(
  trx: TrxOrDb,
  opts: MarkInvalidSharedOpts,
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
  opts: { include_invalid?: boolean } = {},
) {
  return trx.selectFrom('patient_records_aggregated')
    .$if(!opts.include_invalid, (qb) => qb.innerJoin('patient_records_still_valid', 'patient_records_still_valid.id', 'patient_records_aggregated.id'))
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
