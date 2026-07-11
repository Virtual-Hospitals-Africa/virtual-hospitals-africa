import { z } from 'zod'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { completeAndProceedToNextStep, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import type { OpenEncounterWorkflowContext } from '../../../../../../../../types.ts'
import SectionHeader from '../../../../../../../../components/library/typography/SectionHeader.tsx'
import { DrawerThisVisit } from '../../../../../../../../components/drawer-v4/ThisVisit.tsx'

const ChartReviewReviewCaseSchema = z.object({})

export const handler = postHandler(
  ChartReviewReviewCaseSchema,
  (ctx: OpenEncounterWorkflowContext, _form_values) => completeAndProceedToNextStep(ctx),
)

function ChartReviewReviewCasePage(
  ctx: OpenEncounterWorkflowContext,
) {
  const {
    organization_id,
    this_visit_findings,
    this_visit_diagnoses,
    encounter,
  } = ctx.state

  return (
    <div className='flex flex-col gap-6 max-w-3xl'>
      <SectionHeader>Patient Chart</SectionHeader>
      <DrawerThisVisit
        id='chart-review-this-visit'
        organization_id={organization_id}
        this_visit_findings={this_visit_findings}
        this_visit_diagnoses={this_visit_diagnoses}
      />
      {encounter.notes && (
        <div className='flex flex-col gap-2'>
          <SectionHeader>Notes</SectionHeader>
          <p className='text-sm text-gray-700'>{encounter.notes}</p>
        </div>
      )}
    </div>
  )
}

export default OpenEncounterWorkflowPage(ChartReviewReviewCasePage)
