import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../util/postHandler.ts'

const TriageAssignPrioritySchema = z.object({})

export const handler = postHandler(
  TriageAssignPrioritySchema,
  // deno-lint-ignore require-await
  async (_req, ctx: OpenEncounterWorkflowContext, _form_values) => {
    // const { trx, encounter, organization_employment } = ctx.state
    return completeAndProceedToNextStep(ctx)
  },
)

// deno-lint-ignore require-await
export async function TriageAssignPriorityPage(
  _ctx: OpenEncounterWorkflowContext,
) {
  return <>TODO</>
}

export default OpenEncounterWorkflowPage(TriageAssignPriorityPage)
