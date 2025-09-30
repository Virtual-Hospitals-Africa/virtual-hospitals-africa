import { removeFromWaitingRoomAndAddSelfAsProvider } from '../../../../../../db/models/patient_encounters.ts'
import { assertOr403 } from '../../../../../../util/assertOr.ts'
import { getRequiredUUIDParam } from '../../../../../../util/getParam.ts'
import redirect from '../../../../../../util/redirect.ts'
import { replaceParams } from '../../../../../../util/replaceParams.ts'
import { OrganizationContext } from '../../_middleware.ts'

export const handler = {
  async POST(_req: Request, ctx: OrganizationContext) {
    const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

    const { encounter } = await removeFromWaitingRoomAndAddSelfAsProvider(
      ctx.state.trx,
      {
        health_worker: ctx.state.health_worker,
        patient_id,
        encounter_id: 'open',
      },
    )

    assertOr403(
      encounter.organization_id === ctx.state.organization.id,
    )

    return redirect(replaceParams(
      '/app/organizations/:organization_id/patients/:patient_id/triage/chief_complaint',
      ctx.params,
    ))
  },
}
