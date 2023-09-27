import { LoggedInHealthWorkerHandler } from '../../types.ts'
import redirect from '../../util/redirect.ts'

export const handler: LoggedInHealthWorkerHandler = {
  GET(_req, ctx) {
    return redirect(
      `/app/facilities/${
        ctx.state.healthWorker.employment[0].facility_id
      }/employees`,
    )
  },
}
