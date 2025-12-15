import { TrxOrDb } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { success_true } from '../helpers.ts'

type DiagnosisInsert = {
  patient_id: string
  patient_encounter_id: string
  employment_id: string
  finding_snomed_concept_id: string
  evaluates_record_id: string
}

export const DIAGNOSIS_SNOMED_CONCEPT_ID = '439401001' // |Diagnosis (observable entity)|

export function insertOne(
  trx: TrxOrDb,
  {
    patient_id,
    patient_encounter_id,
    employment_id,
    finding_snomed_concept_id,
    evaluates_record_id,
  }: DiagnosisInsert,
) {
  const evaluation_id = generateUUID()
  const qualifier_id = generateUUID()

  return trx.with(
    'inserting_evaluation_records',
    (qb) =>
      qb.insertInto('patient_records')
        .values({
          id: evaluation_id,
          patient_id,
          patient_encounter_id,
          snomed_concept_id: DIAGNOSIS_SNOMED_CONCEPT_ID,
        }),
  ).with('inserting_evaluations', (qb) =>
    qb.insertInto('patient_evaluations')
      .values({
        id: evaluation_id,
        by_system: false,
        employment_id,
        evaluates_record_id,
      })).with(
      'inserting_qualifier_records',
      (qb) =>
        qb.insertInto('patient_records')
          .values({
            id: qualifier_id,
            snomed_concept_id: finding_snomed_concept_id,
            patient_id,
            patient_encounter_id,
          }),
    ).with(
      'inserting_qualifiers',
      (qb) =>
        qb.insertInto('patient_record_qualifiers')
          .values({
            id: qualifier_id,
            qualifies_record_id: evaluation_id,
          }),
    )
    .selectNoFrom([
      success_true,
    ])
    .executeTakeFirstOrThrow()
}
