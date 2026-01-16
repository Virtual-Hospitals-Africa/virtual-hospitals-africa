import { OpenEncounterWorkflowContext, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { success }         from '../../../../../../../../util/alerts.ts'
import redirect from '../../../../../../../../util/redirect.ts'
import { preferredName } from '../../../../../../../../util/asNames.ts'
import capitalize from '../../../../../../../../util/capitalize.ts'
import { replaceParams } from '../../../../../../../../util/replaceParams.ts'
import { employees } from '../../../../../../../../db/models/employees.ts'
import ProvidersSelect from '../../../../../../../../islands/ProvidersSelect.tsx'

export const EmergencyEscalationNotifyStaffSchema = z.object({
  provider_ids: z.string().uuid().array()
}).strict()

export const handler = postHandler(
  EmergencyEscalationNotifyStaffSchema,
  // deno-lint-ignore no-unused-vars
  async (ctx: OpenEncounterWorkflowContext, form_values) => {
    const { organization_id, encounter } = ctx.state
    console.log(form_values)

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
  const providers = await employees.findAll(ctx.state.trx, {
    organization_id: ctx.state.organization_id
  })

  return (
    <ProvidersSelect providers={providers}/>
  )
}

export default OpenEncounterWorkflowPage(EmergencyEscalationNotifyStaffPage)
