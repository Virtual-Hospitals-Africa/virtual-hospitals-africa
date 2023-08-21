import { Handlers } from '$fresh/server.ts'
import { oauthParams } from '../external-clients/google.ts'
import { isHealthWorkerWithGoogleTokens } from '../db/models/health_workers.ts'
import redirect from '../util/redirect.ts'
import { WithSession } from 'https://raw.githubusercontent.com/will-weiss/fresh-session/main/mod.ts'
import { Buffer } from 'https://deno.land/std@0.140.0/io/buffer.ts'

export const handler: Handlers<unknown, WithSession> = {
  GET(_req, ctx) {
    const healthWorker = ctx.state.session.data

    if (isHealthWorkerWithGoogleTokens(healthWorker)) {
      return redirect('/app')
    }

    const loginUrl =
      `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?${oauthParams}`
    return redirect(loginUrl)
  },
}
