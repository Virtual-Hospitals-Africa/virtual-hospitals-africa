import {
  completeStep,
  EncounterContext,
  EncounterLayout,
} from './_middleware.tsx'
import {
  LoggedInHealthWorkerHandlerWithProps,
  PatientSymptomUpsert,
} from '../../../../../../types.ts'
import FormButtons from '../../../../../../islands/form/buttons.tsx'
import * as patient_symptoms from '../../../../../../db/models/patient_symptoms.ts'
import SymptomSection from '../../../../../../islands/symptoms/Section.tsx'
import { parseRequestAsserts } from '../../../../../../util/parseForm.ts'
import { getRequiredUUIDParam } from '../../../../../../util/getParam.ts'
import { assertOr400 } from '../../../../../../util/assertOr.ts'
import isObjectLike from '../../../../../../util/isObjectLike.ts'
import {
  isISODateString,
  todayISOInHarare,
} from '../../../../../../util/date.ts'

function assertIsSymptoms(body: unknown): asserts body is {
  symptoms?: PatientSymptomUpsert[]
} {
  assertOr400(isObjectLike(body))
  if (!body.symptoms) return
  assertOr400(Array.isArray(body.symptoms), 'Invalid symptoms')
  for (const symptom of body.symptoms) {
    assertOr400(isObjectLike(symptom), 'Invalid symptom')
    assertOr400(typeof symptom.code === 'string', 'Invalid symptom')
    assertOr400(
      typeof symptom.severity === 'number' &&
        symptom.severity >= 1 &&
        symptom.severity <= 10,
      'Invalid symptom severity',
    )
    assertOr400(
      typeof symptom.start_date === 'string' &&
        isISODateString(symptom.start_date),
      'Invalid symptom start_date',
    )
    assertOr400(
      symptom.end_date === undefined ||
        (typeof symptom.end_date === 'string' &&
          isISODateString(symptom.end_date)),
      'Invalid symptom end_date',
    )
    assertOr400(
      symptom.notes === undefined || typeof symptom.notes === 'string',
      'Invalid symptom notes',
    )
  }
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  EncounterContext['state']
> = {
  async POST(req, ctx: EncounterContext) {
    const completing_step = completeStep(ctx)

    const { symptoms = [] } = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsSymptoms,
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

export default async function SymptomsPage(
  _req: Request,
  ctx: EncounterContext,
) {
  const symptoms = await patient_symptoms.getEncounter(ctx.state.trx, {
    encounter_id: ctx.state.encounter.encounter_id,
    patient_id: ctx.state.patient.id,
  })

  const today = todayISOInHarare()

  return (
    <EncounterLayout ctx={ctx}>
      <SymptomSection patient_symptoms={symptoms} today={today} />
      <FormButtons />
    </EncounterLayout>
  )
}
