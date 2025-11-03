import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../util/postHandler.ts'

const TriageMeasureVitalsSchema = z.object({})

export const handler = postHandler(
  TriageMeasureVitalsSchema,
  // deno-lint-ignore require-await
  async (ctx: OpenEncounterWorkflowContext, _form_values) => {
    // const { trx, encounter } = ctx.state

    return completeAndProceedToNextStep(ctx)
  },
)

// deno-lint-ignore require-await
export async function TriageMeasureVitalsPage(
  _ctx: OpenEncounterWorkflowContext,
) {
  return <>TODO</>
}

export default OpenEncounterWorkflowPage(TriageMeasureVitalsPage)
