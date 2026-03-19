import { deleteCookie } from 'std/http/cookie.ts'
import redirect from '../../util/redirect.ts'
import { sessions } from '../../db/models/sessions.ts'
import db from '../../db/db.ts'
import { LoggedInHealthWorkerContext } from '../../types.ts'
import { getSessionCookie, session_key } from '../../shared/session_cookie.ts'

export const handler = {
  async GET(ctx: LoggedInHealthWorkerContext) {
    const session_id = getSessionCookie(ctx.req)
    if (session_id) {
      await sessions.removeById(db, session_id)
    }
    const response = redirect('/')
    deleteCookie(response.headers, session_key)
    deleteCookie(response.headers, 'health_worker_id')
    return response
  },
}
