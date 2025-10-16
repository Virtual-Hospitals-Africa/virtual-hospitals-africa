import {
  completeLastStep,
  nextRouteAfterCompletingWorkflow,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import redirect from '../../../../../../../../util/redirect.ts'
import { promiseProps } from '../../../../../../../../util/promiseProps.ts'
import { updateForOpenEncounterAfterCompletingWorkflow } from '../../../../../../../../db/models/patient_presence.ts'

const TriageRoutePatientSchema = z.object({})

export const handler = postHandler(
  TriageRoutePatientSchema,
  async (_req, ctx: OpenEncounterWorkflowContext, _form_values) => {
    const { trx, encounter, organization_employment } = ctx.state

    const { next_patient_presence } = await promiseProps({
      completed_last_step: completeLastStep(ctx),
      next_patient_presence: updateForOpenEncounterAfterCompletingWorkflow(
        trx,
        encounter,
        organization_employment,
      ),
    })

    return redirect(
      nextRouteAfterCompletingWorkflow(ctx, next_patient_presence),
    )
  },
)

// deno-lint-ignore require-await
export async function TriageRoutePatientPage(
  _ctx: OpenEncounterWorkflowContext,
) {
  return <>TODO</>
}

export default OpenEncounterWorkflowPage(TriageRoutePatientPage)
