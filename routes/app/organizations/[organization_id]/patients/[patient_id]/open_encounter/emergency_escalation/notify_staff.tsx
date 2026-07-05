import { assertAllPriorStepsCompleted, OpenEncounterWorkflowPage } from '../_middleware.tsx'
import type { OpenEncounterWorkflowContext } from '../../../../../../../../types.ts'
import { z } from 'zod'
import { postHandler } from '../../../../../../../../backend/postHandler.ts'
import { success } from '../../../../../../../../util/alerts.ts'
import redirect from '../../../../../../../../util/redirect.ts'
import { preferredName } from '../../../../../../../../util/asNames.ts'
import capitalize from '../../../../../../../../util/capitalize.ts'
import { replaceParams } from '../../../../../../../../util/replaceParams.ts'
import ProvidersSelect from '../../../../../../../../islands/ProvidersSelect.tsx'
import { delay } from '../../../../../../../../util/delay.ts'
import { employees_presence } from '../../../../../../../../db/models/employees_presence.ts'

export const EmergencyEscalationNotifyStaffSchema = z.object({
  employee_ids: z.string().uuid().array(),
})

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
      `Please escort ${capitalize(preferredName(encounter.patient, 'patient'))} to ${next_room_name}`,
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
  const { trx, organization_id, health_worker_id, organization_employment } = ctx.state

  const clinic_employees = await employees_presence.getAllAtOrganization(trx, {
    organization_id,
    excluding_health_worker: {
      health_worker_id,
      at_work: true,
      seniority_order: organization_employment.seniority_order,
    },
  })

  return <ProvidersSelect providers={clinic_employees} />
}

export default OpenEncounterWorkflowPage(EmergencyEscalationNotifyStaffPage)
