import {
  completeStep,
  EncounterContext,
  EncounterLayout,
} from './_middleware.tsx'
import { LoggedInHealthWorkerHandlerWithProps } from '../../../../../../types.ts'
import * as doctor_reviews from '../../../../../../db/models/doctor_reviews.ts'
import * as patient_encounters from '../../../../../../db/models/patient_encounters.ts'
import FormButtons from '../../../../../../islands/form/buttons.tsx'
import { ENCOUNTER_STEPS } from '../../../../../../shared/encounter.ts'
import { assertAllPriorStepsCompleted } from '../../../../../../util/assertAllPriorStepsCompleted.ts'
import redirect from '../../../../../../util/redirect.ts'

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  EncounterContext['state']
> = {
  async POST(_req: Request, ctx: EncounterContext) {
    const { trx, encounter, encounter_provider } = ctx.state
    const completing_step = completeStep(ctx)
    const finalizing_request = doctor_reviews.finalizeRequest(trx, {
      requested_by: encounter_provider.patient_encounter_provider_id,
      patient_encounter_id: encounter.encounter_id,
    })
    const completing_encounter = patient_encounters.close(trx, {
      encounter_id: encounter.encounter_id,
    })
    await completing_step
    const review_request = await finalizing_request
    await completing_encounter
    let success = `🩺 Thanks for seeing ${ctx.state.patient.name}!`
    if (review_request) {
      success +=
        ` Your review request has been sent out and you'll be notified when the review is complete.`
    }
    return redirect(`/app?success=${encodeURIComponent(success)}`)
  },
}

const assertAllEncounterStepsCompleted = assertAllPriorStepsCompleted(
  ENCOUNTER_STEPS,
  '/app/patients/:patient_id/encounters/:encounter_id/:step',
  'closing the visit',
)

// deno-lint-ignore require-await
export default async function CloseVisitPage(
  _req: Request,
  ctx: EncounterContext,
) {
  assertAllEncounterStepsCompleted(
    ctx.state.encounter.steps_completed,
    ctx.params,
  )

  return (
    <EncounterLayout ctx={ctx}>
      <FormButtons />
    </EncounterLayout>
  )
}
