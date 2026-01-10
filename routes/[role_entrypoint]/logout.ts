import { deleteCookie } from 'std/http/cookie.ts'
import redirect from '../../util/redirect.ts'
import { sessions } from '../../db/models/sessions.ts'
import * as cookie from '../../shared/cookie.ts'
import db from '../../db/db.ts'
import { LoggedInHealthWorkerContext } from '../../types.ts'

export const handler = {
  async GET(ctx: LoggedInHealthWorkerContext) {
    const session_id = cookie.get(ctx.req)
    if (session_id) {
      await sessions.removeById(db, session_id)
    }
    const response = redirect('/')
    deleteCookie(response.headers, cookie.session_key)
    return response
  },
}
