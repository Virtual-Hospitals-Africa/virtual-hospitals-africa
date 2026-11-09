import { completeAndProceedToNextStep, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import type { OpenEncounterWorkflowPostContext } from '../../../../../../../../types.ts'

export const handler = {
  // deno-lint-ignore require-await
  async POST(ctx: OpenEncounterWorkflowPostContext) {
    const completing_step = completeAndProceedToNextStep(ctx)
    return completing_step
  },
}

export default OpenEncounterWorkflowPage(
  function PrescriptionsPage(
    _ctx: OpenEncounterWorkflowPostContext,
  ) {
    return <p>TODO</p>
  },
)
