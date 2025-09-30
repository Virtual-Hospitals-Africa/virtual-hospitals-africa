import { z } from 'zod'
import {
  completeStep,
  EncounterContext,
  EncounterPage,
} from './_middleware.tsx'
import * as patient_chief_complaints from '../../../../../../db/models/patient_chief_complaints.ts'
import { getAll as getAllLanguages } from '../../../../../../db/models/languages.ts'
import { getRequiredUUIDParam } from '../../../../../../util/getParam.ts'
import { postHandler } from '../../../../../../util/postHandler.ts'
import { promiseProps } from '../../../../../../util/promiseProps.ts'
import { ChiefComplaintSection } from '../../../../../../islands/chief-complaint/Section.tsx'

const PatientChiefComplaintSchema = z.object({
  altered_patient_chief_complaint_id: z.string().uuid().optional(),
  language_code: z.string().length(3),
  media_speech_id: z.string().optional(),
  note: z.string(),
})

export const handler = postHandler(
  PatientChiefComplaintSchema,
  async (_req, ctx: EncounterContext, form_values) => {
    const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

    await patient_chief_complaints.upsertOne(ctx.state.trx, {
      patient_id,
      encounter_id: ctx.state.encounter.encounter_id,
      encounter_provider_id:
        ctx.state.encounter_provider.patient_encounter_provider_id,
      chief_complaint: form_values,
    })

    return completeStep(ctx)
  },
)

export async function ChiefComplaintPage(
  ctx: EncounterContext,
) {
  const {
    languages,
    chief_complaint,
  } = await promiseProps({
    languages: getAllLanguages(ctx.state.trx),
    chief_complaint: patient_chief_complaints.getEncounter(ctx.state.trx, {
      encounter_id: ctx.state.encounter.encounter_id,
      patient_id: ctx.state.patient.id,
    }),
  })

  return (
    <ChiefComplaintSection
      preferred_language_code_iso_639_2_b={ctx.state.patient
        .preferred_language_code_iso_639_2_b}
      patient_chief_complaint={chief_complaint}
      languages={languages}
    />
  )
}

export default EncounterPage(ChiefComplaintPage)
