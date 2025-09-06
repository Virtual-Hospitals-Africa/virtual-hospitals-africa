import { z } from 'zod'
import {
  completeStep,
  EncounterContext,
  EncounterPage,
} from './_middleware.tsx'
import * as patient_symptoms from '../../../../../../db/models/patient_symptoms.ts'
import SymptomSection from '../../../../../../islands/symptoms/Section.tsx'
import { getRequiredUUIDParam } from '../../../../../../util/getParam.ts'
import { todayISOInHarare } from '../../../../../../util/date.ts'
import { postHandler } from '../../../../../../util/postHandler.ts'
import { assert } from 'std/assert/assert.ts'
import redirect from '../../../../../../util/redirect.ts'
import { snomed_concept_id } from '../../../../../../util/validators.ts'

const MediaSchema = z.object({
  id: z.string(),
})

const PatientSymptomSchema = z.object({
  done: z.boolean(),
}).or(z.object({
  altered_patient_symptom_id: z.string().uuid().optional(),
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

    if ('done' in form_values) {
      assert(form_values.done)
      return completeStep(ctx)
    }

    const symptom = form_values

    await patient_symptoms.upsertOne(ctx.state.trx, {
      patient_id,
      encounter_id: ctx.state.encounter.encounter_id,
      encounter_provider_id:
        ctx.state.encounter_provider.patient_encounter_provider_id,
      symptom,
    })

    return redirect(ctx.url)
  },
)

export async function SymptomsPage(
  ctx: EncounterContext,
) {
  const symptoms = await patient_symptoms.getEncounter(ctx.state.trx, {
    encounter_id: ctx.state.encounter.encounter_id,
    patient_id: ctx.state.patient.id,
  })

  const today = todayISOInHarare()

  return (
    <SymptomSection
      patient_symptoms={symptoms}
      today={today}
    />
  )
}

export default EncounterPage(SymptomsPage)
