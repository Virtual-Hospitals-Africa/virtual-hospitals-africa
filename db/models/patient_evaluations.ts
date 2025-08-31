import { Measurement, TrxOrDb } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'

/*
  Patient evaluations are clinical assessments made by healthcare providers
  regarding patient findings, procedures, or other evaluations.

  Business Rules:
  - If nurse didn't flag and didn't add a note -> do not save an evaluation
  - If nurse didn't flag and added a note -> save an evaluation with priority: normal & with the note
  - If nurse flagged -> save an evaluation with the flag's priority and with the optional note

  Currently implemented: note-based evaluations only (flagging/priority system to be added later)
*/

export async function insertEvaluations(
  trx: TrxOrDb,
  {
    patient_id,
    encounter_id,
    encounter_provider_id,
    procedure_id: _procedure_id,
    input_measurements,
  }: {
    patient_id: string
    encounter_id: string
    encounter_provider_id: string
    procedure_id: string
    input_measurements: Measurement[]
  },
) {
  const evaluationsToInsert = input_measurements
    .filter((measurement) => {
      if (!measurement.evaluation) return false

      const { note } = measurement.evaluation

      return note !== undefined && note !== null && note.trim() !== ''
    })
    .map((measurement) => ({
      id: generateUUID(),
      patient_id,
      encounter_id,
      encounter_provider_id,
      finding_id: measurement.finding_id!,
      snomed_concept_id: measurement.snomed_concept_id,
      note: measurement.evaluation!.note!,
    }))

  if (evaluationsToInsert.length > 0) {
    await trx.insertInto('patient_evaluations')
      .values(evaluationsToInsert)
      .execute()
  }
}
