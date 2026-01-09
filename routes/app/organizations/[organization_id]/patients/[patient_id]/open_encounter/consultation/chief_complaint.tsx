import { z } from 'zod'
import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import * as patient_chief_complaints from '../../../../../../../../db/models/patient_chief_complaints.ts'
import { getRequiredUUIDParam } from '../../../../../../../../util/getParam.ts'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { ChiefComplaintSection } from '../../../../../../../../islands/chief-complaint/Section.tsx'

const PatientChiefComplaintSchema = z.object({
  altered_patient_chief_complaint_id: z.string().uuid().optional(),
  language_code: z.string().length(3),
  media_speech_id: z.string().optional(),
  note: z.string(),
})

export const handler = postHandler(
  PatientChiefComplaintSchema,
  async (ctx: OpenEncounterWorkflowContext, form_values) => {
    const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

    await patient_chief_complaints.upsertOne(ctx.state.trx, {
      patient_id,
      patient_encounter_id: ctx.state.encounter.patient_encounter_id,
      employment_id: ctx.state.organization_employment.employment_id,
      patient_encounter_employee_id:
        ctx.state.encounter_employee_presence.patient_encounter_employee_id,
      chief_complaint: form_values,
    })

    return completeAndProceedToNextStep(ctx)
  },
)

export async function ChiefComplaintPage(
  ctx: OpenEncounterWorkflowContext,
) {
  const chief_complaint = await patient_chief_complaints.getEncounter(
    ctx.state.trx,
    {
      patient_encounter_id: ctx.state.encounter.patient_encounter_id,
      patient_id: ctx.state.patient.id,
    },
  )

  return (
    <ChiefComplaintSection
      preferred_language_code_iso_639_2_b={ctx.state.patient
        .preferred_language_code_iso_639_2_b}
      patient_chief_complaint={chief_complaint}
    />
  )
}

export default OpenEncounterWorkflowPage(ChiefComplaintPage)
