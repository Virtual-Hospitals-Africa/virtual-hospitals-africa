import { Handlers } from '$fresh/server.ts'
import { oauthParams } from '../external-clients/google.ts'
import redirect from '../util/redirect.ts'
import { getHealthWorkerCookie } from './app/_middleware.ts'

export const login_href =
  `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?${oauthParams}`

// TODO check if cookie legit first?
export const handler: Handlers = {
  GET(req) {
    return redirect(
      getHealthWorkerCookie(req) ? '/app?from_login=true' : login_href,
    )
  },
}
