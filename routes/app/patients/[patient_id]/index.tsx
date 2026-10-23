import { LoggedInHealthWorkerContext } from '../../../../types.ts'
import { defaultOrganizationId } from '../../../../shared/defaultOrganizationId.ts'
import redirect from '../../../../util/redirect.ts'
import { Handlers } from 'fresh/compat'

export const handler: Handlers<unknown, LoggedInHealthWorkerContext['state']> = {
  GET: (ctx) => {
    const organization_id = defaultOrganizationId(ctx.state.health_worker)
    return redirect(
      `/app/organizations/${organization_id}/patients/${ctx.params.patient_id}/case`,
    )
  },
}
