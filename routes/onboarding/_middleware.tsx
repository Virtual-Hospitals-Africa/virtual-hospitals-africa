import * as health_workers from '../../db/models/health_workers.ts'
import redirect from '../../util/redirect.ts'
import { deleteCookie } from 'std/http/cookie.ts'
import * as cookie from '../../shared/cookie.ts'
import { startTrx, TrxContext } from '../../shared/startTrx.ts'
import { login_href } from '../login.tsx'
import {
  ensureCookiePresent,
  getLoggedInHealthWorkerFromCookie,
  noSession,
} from '../app/_middleware.tsx'
import { PossiblyEmployedHealthWorker } from '../../types.ts'

export const handler = [
  ensureCookiePresent,
  startTrx,
  getLoggedInHealthWorker,
]

export type OnboardingContext = TrxContext & {
  state: {
    healthWorker: PossiblyEmployedHealthWorker
  }
}

async function getLoggedInHealthWorker(
  req: Request,
  ctx: OnboardingContext,
) {
  const healthWorker = await getLoggedInHealthWorkerFromCookie(req, ctx)

  if (!healthWorker) {
    const from_login = ctx.url.searchParams.has('from_login')
    const response = from_login ? redirect(login_href) : noSession()
    deleteCookie(response.headers, cookie.session_key)
    return response
  }

  if (health_workers.isEmployed(healthWorker)) {
    return redirect('/app')
  }

  ctx.state.healthWorker = healthWorker
  return ctx.next()
}
