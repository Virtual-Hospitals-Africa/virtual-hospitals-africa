import { completeAndProceedToNextStep, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import type { OpenEncounterWorkflowContext } from '../../../../../../../../types.ts'

export const handler = {
  // deno-lint-ignore require-await
  async POST(ctx: OpenEncounterWorkflowContext) {
    const completing_step = completeAndProceedToNextStep(ctx)
    return completing_step
  },
}

export default OpenEncounterWorkflowPage(
  function ClinicalNotesPage(_ctx) {
    return <p>TODO</p>
  },
)
