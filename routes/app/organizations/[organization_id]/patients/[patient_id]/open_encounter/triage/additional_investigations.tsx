import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../util/postHandler.ts'

const TriageAdditionalInvestigationsSchema = z.object({})

export const handler = postHandler(
  TriageAdditionalInvestigationsSchema,
  // deno-lint-ignore require-await
  async (_req, ctx: OpenEncounterWorkflowContext, _form_values) => {
    // const { trx, encounter } = ctx.state

    return completeAndProceedToNextStep(ctx)
  },
)

// deno-lint-ignore require-await
export async function TriageAdditionalInvestigationsPage(
  _ctx: OpenEncounterWorkflowContext,
) {
  return <>TODO</>
}

export default OpenEncounterWorkflowPage(TriageAdditionalInvestigationsPage)
