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
import { assert } from 'std/assert/assert.ts'
import redirect from '../../../../../../util/redirect.ts'
import { snomed_concept_id } from '../../../../../../util/validators.ts'
import { promiseProps } from '../../../../../../util/promiseProps.ts'
import { ChiefComplaintSection } from '../../../../../../islands/chief-complaint/Section.tsx'

const MediaSchema = z.object({
  id: z.string(),
})

const PatientSymptomSchema = z.object({
  done: z.boolean(),
}).or(z.object({
  altered_patient_chief_complaint_id: z.string().uuid().optional(),
  snomed_concept_id,
  severity: z.number().min(1).max(10),
  start_date: z.string().date(),
  end_date: z.string().date().optional(),
  notes: z.string().optional(),
  media: z.array(MediaSchema).optional(),
}))

export const handler = postHandler(
  PatientSymptomSchema,
  async (_req, ctx: EncounterContext, form_values) => {
    const patient_id = getRequiredUUIDParam(ctx, 'patient_id')
    await Promise.resolve(patient_id)

    if ('done' in form_values) {
      assert(form_values.done)
      return completeStep(ctx)
    }

    // const chief_complaint = form_values

    // await patient_chief_complaints.upsertOne(ctx.state.trx, {
    //   patient_id,
    //   encounter_id: ctx.state.encounter.encounter_id,
    //   encounter_provider_id:
    //     ctx.state.encounter_provider.patient_encounter_provider_id,
    //   chief_complaint,
    // })

    return redirect(ctx.url)
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
      patient_chief_complaint={chief_complaint}
      languages={languages}
    />
  )
}

export default EncounterPage(ChiefComplaintPage)
