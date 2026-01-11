import { ensureCookiePresent, getLoggedInHealthWorker } from '../app/_middleware.tsx'
import { PossiblyEmployedHealthWorker } from '../../types.ts'
import { attachTrx, TrxContext } from '../../backend/attachTrx.ts'
import { health_workers } from '../../db/models/health_workers.ts'
import redirect from '../../util/redirect.ts'

export type OnboardingContext = TrxContext & {
  state: {
    session_id: string
    health_worker: PossiblyEmployedHealthWorker
  }
}

export const handler = [
  ensureCookiePresent,
  getLoggedInHealthWorker({ require_employment: false }),
  redirectToAppIfEmployedAlready,
  attachTrx,
]

function redirectToAppIfEmployedAlready(
  ctx: OnboardingContext,
) {
  return health_workers.isEmployed(ctx.state.health_worker) ? redirect('/app') : ctx.next()
}
