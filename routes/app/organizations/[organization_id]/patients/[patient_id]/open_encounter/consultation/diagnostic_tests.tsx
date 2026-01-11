import { completeAndProceedToNextStep, OpenEncounterWorkflowContext, OpenEncounterWorkflowPage } from '../_middleware.tsx'

export const handler = {
  // deno-lint-ignore require-await
  async POST(ctx: OpenEncounterWorkflowContext) {
    const completing_step = completeAndProceedToNextStep(ctx)
    return completing_step
  },
}

export default OpenEncounterWorkflowPage(
  function DiagnosticTestsPage(
    _ctx,
  ) {
    return <p>TODO</p>
  },
)
