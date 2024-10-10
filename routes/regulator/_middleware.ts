import { FreshContext } from '$fresh/server.ts'
import { LoggedInRegulatorContext } from '../../types.ts'
import * as regulators from '../../db/models/regulators.ts'
import redirect from '../../util/redirect.ts'
import { assert } from 'std/assert/assert.ts'
import { deleteCookie, getCookies } from 'std/http/cookie.ts'
import { startTrx } from '../../shared/startTrx.ts'
import { warning } from '../../util/alerts.ts'
import { login_href } from '../login.tsx'

export const handler = [
  ensureCookiePresent,
  redirectIfAtRoot,
  startTrx,
  getLoggedInRegulator,
]

export const could_not_locate_account_href = warning(
  "Could not locate your account. Please try logging in once more. If this issue persists, please contact your organization's administrator.",
)
function noSession() {
  return redirect(could_not_locate_account_href)
}

export function getRegulatorCookie(req: Request): string | undefined {
  return getCookies(req.headers).regulator_session_id
}

function ensureCookiePresent(req: Request, ctx: FreshContext) {
  return getRegulatorCookie(req) ? ctx.next() : noSession()
}

function redirectIfAtRoot(req: Request, ctx: FreshContext) {
  return req.url === '/regulator'
    ? redirect('/regulator/pharmacists')
    : ctx.next()
}

async function getLoggedInRegulator(
  req: Request,
  ctx: LoggedInRegulatorContext,
) {
  const regulator_session_id = getRegulatorCookie(req)
  assert(regulator_session_id)

  const regulator = await regulators.getBySession(ctx.state.trx, {
    regulator_session_id,
  })

  if (!regulator) {
    const from_login = ctx.url.searchParams.has('from_login')
    const response = from_login ? redirect(login_href) : noSession()
    deleteCookie(response.headers, 'regulator_session_id')
    return response
  }

  ctx.state.regulator = regulator
  return ctx.next()
}
