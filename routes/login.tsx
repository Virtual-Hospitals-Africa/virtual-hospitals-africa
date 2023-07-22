import { Handlers } from '$fresh/server.ts'
import { oauthParams } from '../external-clients/google.ts'
import { isHealthWorkerWithGoogleTokens } from '../db/models/health_workers.ts'
import redirect from '../util/redirect.ts'
import { WithSession } from 'https://raw.githubusercontent.com/will-weiss/fresh-session/main/mod.ts'
import { redis } from '../external-clients/redis.ts'
import { sessionId } from '../routes/accept-invite/[inviteCode].tsx'

export const handler: Handlers<unknown, WithSession> = {
  async GET(_req, ctx) {
    const healthWorker = ctx.state.session.data

    if (isHealthWorkerWithGoogleTokens(healthWorker)) {
      const isInvitee = await redis.get(sessionId)
      if (isInvitee) {
        return redirect('/app/redirect-accept-invite')
      }
      return redirect('/app')
    }
    const loginUrl =
      `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?${oauthParams}`
    return redirect(loginUrl)
  },
}
