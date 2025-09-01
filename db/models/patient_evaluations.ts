import { Maybe, TrxOrDb } from '../../types.ts'

/*
  Patient evaluations are clinical assessments made by healthcare providers
  regarding patient findings, procedures, or other evaluations.

  Business Rules:
  - If nurse didn't flag and didn't add a note -> do not save an evaluation
  - If nurse didn't flag and added a note -> save an evaluation with priority: normal & with the note
  - If nurse flagged -> save an evaluation with the flag's priority and with the optional note

  Currently implemented: note-based evaluations only (flagging/priority system to be added later)
*/

export type EvaluationInsert =
  & {
    snomed_concept_id: string
    note?: Maybe<string>
  }
  & (
    | {
      finding_id: string
      procedure_id?: undefined
      evaluation_id?: undefined
    }
    | {
      finding_id: undefined
      procedure_id?: string
      evaluation_id?: undefined
    }
    | {
      finding_id: undefined
      procedure_id?: undefined
      evaluation_id?: string
    }
  )

export async function insertFromProvider(
  trx: TrxOrDb,
  {
    patient_id,
    encounter_id,
    encounter_provider_id,
    evaluations,
  }: {
    patient_id: string
    encounter_id: string
    encounter_provider_id: string
    evaluations: EvaluationInsert[]
  },
) {
  if (!evaluations.length) return

  await trx.insertInto('patient_evaluations')
    .values(evaluations.map((evaluation) => ({
      patient_id,
      encounter_id,
      encounter_provider_id,
      ...evaluation,
    })))
    .execute()
}
