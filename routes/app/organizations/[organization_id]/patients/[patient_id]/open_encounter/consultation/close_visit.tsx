import { assertAllPriorStepsCompleted, completeAndProceedToNextStep, OpenEncounterWorkflowContext, OpenEncounterWorkflowPage } from '../_middleware.tsx'

import { patient_encounters } from '../../../../../../../../db/models/patient_encounters.ts'
import redirect from '../../../../../../../../util/redirect.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'

export const handler = {
  async POST(ctx: OpenEncounterWorkflowContext) {
    const { trx, encounter } = ctx.state
    await promiseProps({
      completing_step: completeAndProceedToNextStep(ctx),
      completing_encounter: patient_encounters.close(trx, {
        patient_encounter_id: encounter.patient_encounter_id,
      }),
    })

    const success = `🩺 Thanks for seeing ${ctx.state.patient.name}!`

    return redirect(`/app?success=${encodeURIComponent(success)}`)
  },
}

export default OpenEncounterWorkflowPage(
  function CloseVisitPage(
    ctx,
  ) {
    assertAllPriorStepsCompleted(ctx, {
      attempting_to_complete_workflow: true,
    })
    return <p>TODO</p>
  },
)
