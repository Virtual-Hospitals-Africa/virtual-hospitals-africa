import { LoggedInHealthWorkerHandlerWithProps } from '../../types.ts'
import redirect from '../../util/redirect.ts'

export const handler: LoggedInHealthWorkerHandlerWithProps = {
  GET(_req, ctx) {
    return redirect(
      `/app/facilities/${
        ctx.state.healthWorker.employment[0].facility.id
      }/employees`,
    )
  },
}
