import { Handlers } from '$fresh/server.ts'
import { oauthParams } from '../external-clients/google.ts'
import redirect from '../util/redirect.ts'
import { WithSession } from 'https://raw.githubusercontent.com/will-weiss/fresh-session/main/mod.ts'

export const handler: Handlers<unknown, WithSession> = {
  GET(_req, ctx) {
    if (ctx.state.session.get('health_worker_id')) {
      return redirect('/app')
    }

    const loginUrl =
      `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?${oauthParams}`
    return redirect(loginUrl)
  },
}
