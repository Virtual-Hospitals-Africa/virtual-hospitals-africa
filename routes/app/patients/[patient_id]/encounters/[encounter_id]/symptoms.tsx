import { z } from 'zod'
import {
  completeStep,
  EncounterContext,
  EncounterPage,
} from './_middleware.tsx'
import { LoggedInHealthWorkerHandlerWithProps } from '../../../../../../types.ts'
import * as patient_symptoms from '../../../../../../db/models/patient_symptoms.ts'
import SymptomSection from '../../../../../../islands/symptoms/Section.tsx'
import { parseRequest } from '../../../../../../util/parseForm.ts'
import { getRequiredUUIDParam } from '../../../../../../util/getParam.ts'
import { todayISOInHarare } from '../../../../../../util/date.ts'

const MediaSchema = z.object({
  id: z.string(),
})

const PatientSymptomUpsertSchema = z.object({
  patient_symptom_id: z.string().uuid().optional(),
  code: z.string(),
  severity: z.number().min(1).max(10),
  start_date: z.string().date(),
  end_date: z.string().date().optional(),
  notes: z.string().optional(),
  media: z.array(MediaSchema).optional(),
  media_edited: z.boolean(),
})

const SymptomsSchema = z.object({
  symptoms: z.array(PatientSymptomUpsertSchema).optional(),
}).refine(
  (data) =>
    new Set(data.symptoms?.map((s) => s.code)).size ==
      (data.symptoms?.length ?? 0),
  {
    message:
      'Symptom codes must be unique, pleas consider removing duplicates.',
    path: ['Symptom'],
  },
)

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  EncounterContext['state']
> = {
  async POST(req, ctx: EncounterContext) {
    const completing_step = completeStep(ctx)

    const { symptoms = [] } = await parseRequest(
      ctx.state.trx,
      req,
      SymptomsSchema.parse,
    )
    const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

    await patient_symptoms.upsert(ctx.state.trx, {
      patient_id,
      encounter_id: ctx.state.encounter.encounter_id,
      encounter_provider_id:
        ctx.state.encounter_provider.patient_encounter_provider_id,
      symptoms,
    })

    return completing_step
  },
}

export async function SymptomsPage(
  ctx: EncounterContext,
) {
  const symptoms = await patient_symptoms.getEncounter(ctx.state.trx, {
    encounter_id: ctx.state.encounter.encounter_id,
    patient_id: ctx.state.patient.id,
  })

  const today = todayISOInHarare()

  return <SymptomSection patient_symptoms={symptoms} today={today} />
}

export default EncounterPage(SymptomsPage)
