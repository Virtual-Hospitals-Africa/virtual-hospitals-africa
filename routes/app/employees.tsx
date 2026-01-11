import { defaultOrganizationId } from '../../shared/defaultOrganizationId.ts'
import { LoggedInHealthWorkerContext } from '../../types.ts'
import redirect from '../../util/redirect.ts'

export const handler = {
  GET(ctx: LoggedInHealthWorkerContext) {
    return redirect(
      `/app/organizations/${defaultOrganizationId(ctx.state.health_worker)}/employees`,
    )
  },
}
