import { EncounterContext, EncounterLayout, nextLink } from './_middleware.tsx'
import {
  LoggedInHealthWorkerHandlerWithProps,
  PatientSymptomUpsert,
} from '../../../../../../types.ts'
import FormButtons from '../../../../../../components/library/form/buttons.tsx'
import * as patient_symptoms from '../../../../../../db/models/patient_symptoms.ts'
import SymptomSection from '../../../../../../islands/symptoms/Section.tsx'
import { parseRequestAsserts } from '../../../../../../util/parseForm.ts'
import { getRequiredNumericParam } from '../../../../../../util/getNumericParam.ts'
import { assertOr400 } from '../../../../../../util/assertOr.ts'
import isObjectLike from '../../../../../../util/isObjectLike.ts'
import {
  isISODateString,
  todayISOInHarare,
} from '../../../../../../util/date.ts'
import redirect from '../../../../../../util/redirect.ts'
import { completedStep } from '../../../../../../db/models/patient_encounters.ts'

function assertIsSymptoms(body: unknown): asserts body is {
  symptoms: PatientSymptomUpsert[]
} {
  assertOr400(isObjectLike(body))
  assertOr400(Array.isArray(body.symptoms), 'Invalid symptoms')
  for (const symptom of body.symptoms) {
    assertOr400(isObjectLike(symptom), 'Invalid symptom')
    assertOr400(typeof symptom.code === 'string', 'Invalid symptom')
    assertOr400(
      typeof symptom.severity === 'number' &&
        symptom.severity >= 1 &&
        symptom.severity <= 10,
      'Invalid symptom',
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
    const { symptoms } = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsSymptoms,
    )
    const patient_id = getRequiredNumericParam(ctx, 'patient_id')

    const completing_step = completedStep(ctx.state.trx, {
      encounter_id: ctx.state.encounter.encounter_id,
      step: 'symptoms',
    })

    await patient_symptoms.upsert(ctx.state.trx, {
      patient_id,
      encounter_id: ctx.state.encounter.encounter_id,
      encounter_provider_id:
        ctx.state.encounter_provider.patient_encounter_provider_id,
      symptoms,
    })

    await completing_step

    return redirect(nextLink(ctx))
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
