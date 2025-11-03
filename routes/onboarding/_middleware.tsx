import {
  ensureCookiePresent,
  getLoggedInHealthWorker,
} from '../app/_middleware.tsx'
import { PossiblyEmployedHealthWorker } from '../../types.ts'
import { attachTrx, TrxContext } from '../../shared/attachTrx.ts'
import { isEmployed } from '../../db/models/health_workers.ts'
import redirect from '../../util/redirect.ts'

export type OnboardingContext = TrxContext & {
  state: {
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
  return isEmployed(ctx.state.health_worker) ? redirect('/app') : ctx.next()
}
