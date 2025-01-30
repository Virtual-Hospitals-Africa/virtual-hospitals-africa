import {
  completeStep,
  EncounterContext,
  EncounterPage,
  EncounterPageChildProps,
} from './_middleware.tsx'
import { LoggedInHealthWorkerHandlerWithProps } from '../../../../../../types.ts'
import * as patient_encounters from '../../../../../../db/models/patient_encounters.ts'
import { ENCOUNTER_STEPS } from '../../../../../../shared/encounter.ts'
import { assertAllPriorStepsCompleted } from '../../../../../../util/assertAllPriorStepsCompleted.ts'
import redirect from '../../../../../../util/redirect.ts'
import { promiseProps } from '../../../../../../util/promiseProps.ts'

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  EncounterContext['state']
> = {
  async POST(_req: Request, ctx: EncounterContext) {
    const { trx, encounter } = ctx.state
    await promiseProps({
      completing_step: completeStep(ctx),
      completing_encounter: patient_encounters.close(trx, {
        encounter_id: encounter.encounter_id,
      }),
    })

    const success = `🩺 Thanks for seeing ${ctx.state.patient.name}!`

    return redirect(`/app?success=${encodeURIComponent(success)}`)
  },
}

const assertAllEncounterStepsCompleted = assertAllPriorStepsCompleted(
  ENCOUNTER_STEPS,
  '/app/patients/:patient_id/encounters/:encounter_id/:step',
  'closing the visit',
)

export default EncounterPage(
  function CloseVisitPage(
    ctx,
  ) {
    assertAllEncounterStepsCompleted(
      ctx.state.encounter.steps_completed,
      ctx.params,
    )
    return <p>TODO</p>
  },
)
