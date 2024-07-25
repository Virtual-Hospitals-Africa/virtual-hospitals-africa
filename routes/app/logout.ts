import { deleteCookie } from 'std/http/cookie.ts'
import redirect from '../../util/redirect.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import { getHealthWorkerCookie } from './_middleware.ts'
import { LoggedInHealthWorkerHandler } from '../../types.ts'

export const handler: LoggedInHealthWorkerHandler = {
  async GET(req, ctx) {
    const health_worker_session_id = getHealthWorkerCookie(req)
    if (health_worker_session_id) {
      await health_workers.removeSession(ctx.state.trx, {
        health_worker_session_id,
      })
    }
    const response = redirect('/')
    deleteCookie(response.headers, 'health_worker_session_id')
    return response
  },
}
