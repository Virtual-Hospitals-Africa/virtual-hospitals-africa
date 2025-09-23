import { PatientTriageContext, PatientTriagePage } from './_middleware.tsx'
import { z } from 'zod'
import { getAll as getAllLanguages } from '../../../../../../../db/models/languages.ts'
import { completeStep } from './_middleware.tsx'
import * as patients from '../../../../../../../db/models/patients.ts'
import * as patient_chief_complaints from '../../../../../../../db/models/patient_chief_complaints.ts'
import { promiseProps } from '../../../../../../../util/promiseProps.ts'
import { ChiefComplaintSection } from '../../../../../../../islands/chief-complaint/Section.tsx'
import { postHandler } from '../../../../../../../util/postHandler.ts'

const PatientChiefComplaintSchema = z.object({
  altered_patient_chief_complaint_id: z.string().uuid().optional(),
  language_code: z.string().length(3),
  media_speech_id: z.string().optional(),
  note: z.string(),
})

export const handler = postHandler(
  PatientChiefComplaintSchema,
  async (_req, ctx: PatientTriageContext, form_values) => {
    const { trx, encounter } = ctx.state

    await patient_chief_complaints.upsertOne(trx, {
      patient_id: encounter.patient_id,
      encounter_id: ctx.state.encounter.encounter_id,
      encounter_provider_id:
        ctx.state.encounter_provider.patient_encounter_provider_id,
      chief_complaint: form_values,
    })

    return completeStep(ctx)
  },
)

export async function ChiefComplaintPage(ctx: PatientTriageContext) {
  const { trx, encounter } = ctx.state
  const { patient_id, encounter_id } = encounter
  const {
    languages,
    preferred_language_code_iso_639_2_b,
    chief_complaint,
  } = await promiseProps({
    languages: getAllLanguages(trx),
    preferred_language_code_iso_639_2_b: patients.getPreferredLanguage(
      trx,
      patient_id,
    ),
    chief_complaint: patient_chief_complaints.getEncounter(trx, {
      encounter_id,
      patient_id,
    }),
  })

  return (
    <ChiefComplaintSection
      preferred_language_code_iso_639_2_b={preferred_language_code_iso_639_2_b}
      patient_chief_complaint={chief_complaint}
      languages={languages}
    />
  )
}

export default PatientTriagePage(ChiefComplaintPage)
