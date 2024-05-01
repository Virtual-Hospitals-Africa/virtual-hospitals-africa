import { LoggedInHealthWorkerHandlerWithProps } from '../../types.ts'
import redirect from '../../util/redirect.ts'

export const handler: LoggedInHealthWorkerHandlerWithProps = {
  GET(_req, ctx) {
    return redirect(
      `/app/organizations/${ctx.state.healthWorker.default_organization_id}/employees`,
    )
  },
}
