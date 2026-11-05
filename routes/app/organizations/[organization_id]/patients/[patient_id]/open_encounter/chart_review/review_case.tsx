import { z } from 'zod'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { completeAndProceedToNextStep, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import type { OpenEncounterWorkflowPostContext } from '../../../../../../../../types.ts'

const ChartReviewReviewCaseSchema = z.object({})

export const handler = postHandler(
  ChartReviewReviewCaseSchema,
  (ctx: OpenEncounterWorkflowPostContext, _form_values) => completeAndProceedToNextStep(ctx),
)

function ChartReviewReviewCasePage(
  _ctx: OpenEncounterWorkflowPostContext,
) {
  // TODO display the case information relevant to the reviewer
  return (
    <p>
      TODO: Review the case
    </p>
  )
}

export default OpenEncounterWorkflowPage(ChartReviewReviewCasePage)
