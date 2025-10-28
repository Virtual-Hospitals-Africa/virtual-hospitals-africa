import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import * as patients from '../../../../../../../../db/models/patients.ts'
import * as patient_chief_complaints from '../../../../../../../../db/models/patient_chief_complaints.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import { ChiefComplaintSection } from '../../../../../../../../islands/chief-complaint/Section.tsx'
import { postHandler } from '../../../../../../../../util/postHandler.ts'

const TriageUrgentSignsSchema = z.object({
  altered_patient_chief_complaint_id: z.string().uuid().optional(),
  language_code: z.string().length(3),
  media_speech_id: z.string().optional(),
  note: z.string(),
})

export const handler = postHandler(
  TriageUrgentSignsSchema,
  async (_req, ctx: OpenEncounterWorkflowContext, form_values) => {
    const { trx, encounter } = ctx.state

    await patient_chief_complaints.upsertOne(trx, {
      patient_id: encounter.patient.id,
      patient_encounter_id: ctx.state.encounter.patient_encounter_id,
      patient_encounter_employee_id:
        ctx.state.encounter_employee_presence.patient_encounter_employee_id,
      chief_complaint: form_values,
    })

    return completeAndProceedToNextStep(ctx)
  },
)

export async function TriageUrgentSignsPage(ctx: OpenEncounterWorkflowContext) {
  const { trx, encounter } = ctx.state
  const patient_id = encounter.patient.id
  const { patient_encounter_id } = encounter
  const {
    preferred_language_code_iso_639_2_b,
    chief_complaint,
  } = await promiseProps({
    preferred_language_code_iso_639_2_b: patients.getPreferredLanguage(
      trx,
      patient_id,
    ),
    chief_complaint: patient_chief_complaints.getEncounter(trx, {
      patient_encounter_id,
      patient_id,
    }),
  })

  return (
    <ChiefComplaintSection
      preferred_language_code_iso_639_2_b={preferred_language_code_iso_639_2_b}
      patient_chief_complaint={chief_complaint}
    />
  )
}

export default OpenEncounterWorkflowPage(TriageUrgentSignsPage)
