import { PreviouslyCompletedProcedures, TrxOrDb } from '../../types.ts'

export async function previouslyCompleted(
  trx: TrxOrDb,
  {
    patient_encounter_id,
    workflow_snomed_concept_id,
    workflow_step_snomed_concept_id,
  }: {
    patient_encounter_id: string
    workflow_snomed_concept_id: string
    workflow_step_snomed_concept_id: string | null
  },
): Promise<PreviouslyCompletedProcedures> {
  const search_for_concept_ids = workflow_step_snomed_concept_id
    ? [workflow_step_snomed_concept_id, workflow_snomed_concept_id]
    : [workflow_snomed_concept_id]

  const procedures = await trx.selectFrom('patient_procedures')
    .innerJoin(
      'patient_records',
      'patient_procedures.id',
      'patient_records.id',
    )
    .where('snomed_concept_id', 'in', search_for_concept_ids)
    .where('patient_encounter_id', '=', patient_encounter_id)
    .select([
      'patient_records.id',
      'patient_records.snomed_concept_id',
    ])
    .execute()

  const workflow_procedure = procedures.find((p) =>
    p.snomed_concept_id === workflow_snomed_concept_id
  )
  const workflow_step_procedure = procedures.find((p) =>
    p.snomed_concept_id === workflow_step_snomed_concept_id
  )

  return {
    workflow_record_id: workflow_procedure?.id || null,
    workflow_step_record_id: workflow_step_procedure?.id || null,
  }
}
