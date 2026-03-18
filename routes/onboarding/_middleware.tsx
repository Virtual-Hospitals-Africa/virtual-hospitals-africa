import { ensureSessionCookiePresent, getLoggedInHealthWorker } from '../app/_middleware.tsx'
import { RenderedHealthWorker } from '../../types.ts'
import { attachTrx, TrxContext } from '../../backend/attachTrx.ts'
import { health_workers } from '../../db/models/health_workers.ts'
import redirect from '../../util/redirect.ts'
import { timeMiddlewareCallNext } from '../../backend/timeMiddleware.ts'

export type OnboardingContext = TrxContext & {
  state: {
    session_id: string
    health_worker: RenderedHealthWorker
  }
}

export const handler = [
  timeMiddlewareCallNext(ensureSessionCookiePresent),
  timeMiddlewareCallNext(getLoggedInHealthWorker({ require_employment: false })),
  timeMiddlewareCallNext(redirectToAppIfEmployedAlready),
  timeMiddlewareCallNext(attachTrx),
]

function redirectToAppIfEmployedAlready(
  ctx: OnboardingContext,
) {
  if (health_workers.isEmployed(ctx.state.health_worker)) {
    return redirect('/app')
  }
}
