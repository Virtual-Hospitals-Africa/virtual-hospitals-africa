import { LoggedInHealthWorkerContext } from '../../types.ts'
import redirect from '../../util/redirect.ts'

export const handler = {
  GET(ctx: LoggedInHealthWorkerContext) {
    return redirect(
      `/app/organizations/${ctx.state.health_worker.default_organization_id}/employees`,
    )
  },
}
