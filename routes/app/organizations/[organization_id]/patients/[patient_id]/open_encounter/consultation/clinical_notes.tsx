import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { LoggedInHealthWorkerHandlerWithProps } from '../../../../../../../../types.ts'

export const handler: LoggedInHealthWorkerHandlerWithProps<
  unknown,
  OpenEncounterWorkflowContext['state']
> = {
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
