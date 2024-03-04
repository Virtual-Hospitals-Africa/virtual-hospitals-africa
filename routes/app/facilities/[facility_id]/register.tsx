import { LoggedInHealthWorkerHandler } from '../../../../types.ts'
import redirect from '../../../../util/redirect.ts'

export const handler: LoggedInHealthWorkerHandler = {
  GET(_req, ctx) {
    return redirect(ctx.url.pathname + '/personal')
  },
}
