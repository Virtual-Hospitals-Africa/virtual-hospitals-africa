import {
  completeAndProceedToNextStep,
  OpenEncounterWorkflowContext,
  OpenEncounterWorkflowPage,
} from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../util/postHandler.ts'
import WarningSigns from '../../../../../../../../islands/WarningSigns.tsx'
import { parseFindingExpression } from '../../../../../../../../db/models/simple_record_language.ts'
import entries from '../../../../../../../../util/entries.ts'

const WarningSignsSchema = z.object({
  warning_signs: z.record(
    z.string(),
    z.string().transform((value) => parseFindingExpression(value)),
  ).optional().default({}).transform((signs) =>
    entries(signs).map(([key, finding]) => ({
      key,
      finding,
    }))
  ),
})

export const handler = postHandler(
  WarningSignsSchema,
  (ctx: OpenEncounterWorkflowContext, _form_values) => {
    return completeAndProceedToNextStep(ctx)
  },
)

export function TriageWarningSignsPage(_ctx: OpenEncounterWorkflowContext) {
  return <WarningSigns />
}

export default OpenEncounterWorkflowPage(TriageWarningSignsPage)
