import { LoggedInHealthWorkerHandlerWithProps } from '../../types.ts'
import redirect from '../../util/redirect.ts'

export const handler: LoggedInHealthWorkerHandlerWithProps = {
  GET(_req, ctx) {
    return redirect(
      `/app/organizations/${ctx.state.health_worker.default_organization_id}/employees`,
    )
  },
}
