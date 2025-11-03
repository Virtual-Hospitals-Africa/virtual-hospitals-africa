import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../util/postHandler.ts'

const TriageAdditionalInvestigationsAndTasksSchema = z.object({})

export const handler = postHandler(
  TriageAdditionalInvestigationsAndTasksSchema,
  // deno-lint-ignore require-await
  async (ctx: OpenEncounterWorkflowContext, _form_values) => {
    // const { trx, encounter } = ctx.state

    return completeAndProceedToNextStep(ctx)
  },
)

// deno-lint-ignore require-await
export async function TriageAdditionalInvestigationsAndTasksPage(
  _ctx: OpenEncounterWorkflowContext,
) {
  return <>TODO</>
}

export default OpenEncounterWorkflowPage(
  TriageAdditionalInvestigationsAndTasksPage,
)
