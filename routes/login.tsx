import { Handlers } from '$fresh/server.ts'
import { oauthParams } from '../external-clients/google.ts'
import { isHealthWorkerWithGoogleTokens } from '../db/models/health_workers.ts'
import redirect from '../util/redirect.ts'
import { WithSession } from 'https://raw.githubusercontent.com/will-weiss/fresh-session/main/mod.ts'
import { redis } from '../external-clients/redis.ts'
import { sessionId } from '../routes/app/facilities/[facilityId]/accept-invite.tsx'

export const handler: Handlers<unknown, WithSession> = {
  GET(_req, ctx) {
    const healthWorker = ctx.state.session.data
    const isInvitee = redis.get(sessionId)
    if (isHealthWorkerWithGoogleTokens(healthWorker) && !isInvitee) {
      return redirect('/app')
    } else if (isHealthWorkerWithGoogleTokens(healthWorker)) {
      return redirect('/app/facilities/[facilityId]/redirectToAcceptInvite')
    }
    const loginUrl =
      `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?${oauthParams}`
    return redirect(loginUrl)
  },
}
