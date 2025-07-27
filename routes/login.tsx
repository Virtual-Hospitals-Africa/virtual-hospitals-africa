import { Handlers } from '$fresh/server.ts'
import { oauthParams } from '../external-clients/google.ts'
import redirect from '../util/redirect.ts'
import * as cookie from '../shared/cookie.ts'
import { getBySessionId } from '../db/models/sessions.ts'
import db from '../db/db.ts'
import { deleteCookie } from 'std/http/cookie.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

export const login_href =
  `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?${oauthParams}`

export const handler: Handlers = {
  async GET(req) {
    const session_id = cookie.get(req)
    if (!session_id) {
      return redirect(login_href)
    }

    const session = await getBySessionId(db, session_id)

    const response = redirect(login_href)
    if (!session) {
      deleteCookie(response.headers, cookie.session_key)
      return response
    }

    if (session.entity_type === 'health_worker') {
      return redirect(`/app?from_login=true`)
    }

    assertEquals(session.entity_type, 'regulator')

    return redirect('/regulator?from_login=true')
  },
}
