import { LoggedInHealthWorkerHandler } from '../../../../types.ts'
import redirect from '../../../../util/redirect.ts'

export const handler: LoggedInHealthWorkerHandler = {
  GET(req) {
    return redirect(req.url + '/personal')
  },
}
