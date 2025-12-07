import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import WarningSigns from '../../../../../../../../islands/WarningSigns.tsx'

const WarningSignsSchema = z.object({
  warning_signs: z.record(z.string(), z.literal('true')).optional(),
})

export const handler = postHandler(
  WarningSignsSchema,
  (ctx: OpenEncounterWorkflowContext, _form_values) => {
    // TODO: Save warning signs to database
    return completeAndProceedToNextStep(ctx)
  },
)

export function TriageWarningSignsPage(_ctx: OpenEncounterWorkflowContext) {
  return <WarningSigns />
}

export default OpenEncounterWorkflowPage(TriageWarningSignsPage)
