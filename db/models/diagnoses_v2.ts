import { DIAGNOSIS } from '../../shared/snomed_concepts.ts'
import { TrxOrDb } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { success_true } from '../helpers.ts'

type DiagnosisInsert = {
  patient_id: string
  patient_encounter_id: string
  employment_id: string
  specific_snomed_concept_id: string
  evaluates_record_id: string
}

export function insertOne(
  trx: TrxOrDb,
  {
    patient_id,
    patient_encounter_id,
    employment_id,
    specific_snomed_concept_id,
    evaluates_record_id,
  }: DiagnosisInsert,
) {
  const evaluation_id = generateUUID()

  return trx.with(
    'inserting_evaluation_records',
    (qb) =>
      qb.insertInto('patient_records')
        .values({
          id: evaluation_id,
          patient_id,
          patient_encounter_id,
          specific_snomed_concept_id,
          root_snomed_concept_id: DIAGNOSIS.id,
        }),
  ).with('inserting_evaluations', (qb) =>
    qb.insertInto('patient_evaluations')
      .values({
        id: evaluation_id,
        by_system: false,
        employment_id,
        evaluates_record_id,
      }))
    .selectNoFrom([
      success_true,
    ])
    .executeTakeFirstOrThrow()
}
