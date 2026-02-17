import { assertAllPriorStepsCompleted, OpenEncounterWorkflowContext, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { success } from '../../../../../../../../util/alerts.ts'
import redirect from '../../../../../../../../util/redirect.ts'
import { preferredName } from '../../../../../../../../util/asNames.ts'
import capitalize from '../../../../../../../../util/capitalize.ts'
import { replaceParams } from '../../../../../../../../util/replaceParams.ts'
import { employees } from '../../../../../../../../db/models/employees.ts'
import ProvidersSelect from '../../../../../../../../islands/ProvidersSelect.tsx'
import { delay } from '../../../../../../../../util/delay.ts'

export const EmergencyEscalationNotifyStaffSchema = z.object({
  employee_ids: z.string().uuid().array(),
}).strict()

export const handler = postHandler(
  EmergencyEscalationNotifyStaffSchema,
  async (ctx: OpenEncounterWorkflowContext, form_values) => {
    const { encounter } = ctx.state
    console.log(form_values)

    assertAllPriorStepsCompleted(ctx, {
      attempting_to_complete_workflow: true,
    })

    await delay(0)

    const next_room_name = 'the resuscitation area'

    const next_url = success(
      `Please move ${capitalize(preferredName(encounter.patient, 'patient'))} to ${next_room_name}`,
      replaceParams(
        `/app/organizations/:organization_id/waiting_room`,
        ctx.params,
      ),
    )
    return redirect(next_url)
  },
)

export async function EmergencyEscalationNotifyStaffPage(
  ctx: OpenEncounterWorkflowContext,
) {
  assertAllPriorStepsCompleted(ctx, {
    attempting_to_complete_workflow: false,
  })

  const providers = await employees.findAll(ctx.state.trx, {
    organization_id: ctx.state.organization_id,
  })

  return <ProvidersSelect providers={providers} />
}

export default OpenEncounterWorkflowPage(EmergencyEscalationNotifyStaffPage)
