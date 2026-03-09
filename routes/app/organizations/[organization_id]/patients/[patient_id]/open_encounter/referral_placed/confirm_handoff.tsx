import { z } from 'zod'
import { success } from '../../../../../../../../util/alerts.ts'
import redirect from '../../../../../../../../util/redirect.ts'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { completeLastStep, OpenEncounterWorkflowContext, OpenEncounterWorkflowPage } from '../_middleware.tsx'

const ReferralPlacedConfirmHandoffSchema = z.object({})

export const handler = postHandler(
  ReferralPlacedConfirmHandoffSchema,
  async (ctx: OpenEncounterWorkflowContext, _form_values) => {
    await completeLastStep(ctx)

    return redirect(
      success(
        'Patient handoff complete.',
        `${ctx.state.organization_pathname}/waiting_room`,
      ),
    )
  },
)

async function ReferralPlacedConfirmHandoffPage(
  ctx: OpenEncounterWorkflowContext,
) {
  await console.log('TODO', ctx)
  return <>TODO</>
}

export default OpenEncounterWorkflowPage(ReferralPlacedConfirmHandoffPage)
