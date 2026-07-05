import { z } from 'zod'
import { success } from '../../../../../../../../util/alerts.ts'
import redirect from '../../../../../../../../util/redirect.ts'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { completeLastStep, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import type { OpenEncounterWorkflowContext } from '../../../../../../../../types.ts'
import { preferredName } from '../../../../../../../../util/asNames.ts'
import { patient_presence } from '../../../../../../../../db/models/patient_presence.ts'

const ChartReviewGiveOrdersSchema = z.object({})

export const handler = postHandler(
  ChartReviewGiveOrdersSchema,
  async (ctx: OpenEncounterWorkflowContext, _form_values) => {
    const { trx, patient, organization_pathname, organization_employment } = ctx.state

    await completeLastStep(ctx)

    // The chart goes back to the colleague still awaiting orders in check_with_colleague
    await patient_presence.set(trx, patient.id, {
      current_workflow: 'check_with_colleague',
      next_workflow: null,
    })

    // TODO actually record the orders and notify the colleague awaiting them
    await trx.updateTable('employment_presence')
      .set({ with_patient_id: null })
      .where('id', '=', organization_employment.employment_id)
      .execute()

    return redirect(
      success(
        `Chart review completed for ${preferredName(patient.names!, 'patient')}.`,
        `${organization_pathname}/waiting_room`,
      ),
    )
  },
)

// deno-lint-ignore require-await
async function ChartReviewGiveOrdersPage(
  _ctx: OpenEncounterWorkflowContext,
) {
  // TODO display a form for giving orders to the colleague awaiting them
  return {
    next_step_text: 'Complete Chart Review',
    children: (
      <p>
        TODO: Give orders
      </p>
    ),
  }
}

export default OpenEncounterWorkflowPage(ChartReviewGiveOrdersPage)
