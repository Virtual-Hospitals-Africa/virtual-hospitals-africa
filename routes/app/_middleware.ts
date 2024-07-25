import { FreshContext } from '$fresh/server.ts'
import { LoggedInHealthWorkerContext } from '../../types.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import redirect from '../../util/redirect.ts'
import { assert } from 'std/assert/assert.ts'
import { deleteCookie, getCookies } from 'std/http/cookie.ts'
import { startTrx } from '../../shared/startTrx.ts'
import { warning } from '../../util/alerts.ts'
import { login_href } from '../login.tsx'

export const handler = [
  ensureCookiePresent,
  startTrx,
  getLoggedInHealthWorker,
  redirectIfRegistrationNeeded,
]

export const could_not_locate_account_href = warning(
  "Could not locate your account. Please try logging in once more. If this issue persists, please contact your organization's administrator.",
)
function noSession() {
  return redirect(could_not_locate_account_href)
}

export function getHealthWorkerCookie(req: Request): string | undefined {
  return getCookies(req.headers).health_worker_session_id
}

function ensureCookiePresent(req: Request, ctx: FreshContext) {
  return getHealthWorkerCookie(req) ? ctx.next() : noSession()
}

async function getLoggedInHealthWorker(
  req: Request,
  ctx: LoggedInHealthWorkerContext,
) {
  const health_worker_session_id = getHealthWorkerCookie(req)
  assert(health_worker_session_id)

  const healthWorker = await health_workers.getBySession(ctx.state.trx, {
    health_worker_session_id,
  })

  if (!healthWorker || !health_workers.isEmployed(healthWorker)) {
    const from_login = ctx.url.searchParams.has('from_login')
    const response = from_login ? redirect(login_href) : noSession()
    deleteCookie(response.headers, 'health_worker_session_id')
    return response
  }

  ctx.state.healthWorker = healthWorker
  return ctx.next()
}

function redirectIfRegistrationNeeded(
  _req: Request,
  ctx: LoggedInHealthWorkerContext,
) {
  const { healthWorker } = ctx.state
  const role_needing_registration = healthWorker.employment.find((e) =>
    e.roles.nurse?.registration_needed || e.roles.doctor?.registration_needed ||
    e.roles.admin?.registration_needed
  )

  // This is not quite right as this will mean that you can't log in if you're pending approval at one organization, even if you're not
  // pending approval at another but not at another.
  // TODO deal with this as part of doctor registration
  const role_pending_approval = healthWorker.employment.find((e) =>
    e.roles.nurse?.registration_pending_approval ||
    e.roles.doctor?.registration_pending_approval ||
    e.roles.admin?.registration_pending_approval
  )

  const availability_not_set = healthWorker.employment.find((e) =>
    !e.availability_set
  )

  function redirectIfNotAlreadyOnPage(
    page: string,
    params?: Record<string, string>,
  ) {
    const current_url = ctx.url.pathname + ctx.url.search
    const on_page = current_url.startsWith(page)
    return on_page
      ? ctx.next()
      : redirect(params ? `${page}?${new URLSearchParams(params)}` : page)
  }

  if (role_needing_registration) {
    return redirectIfNotAlreadyOnPage(
      `/app/organizations/${role_needing_registration.organization.id}/register`,
    )
  }

  // TODO make a page for this purpose
  if (role_pending_approval) {
    return redirectIfNotAlreadyOnPage('/app/pending_approval')
  }

  if (availability_not_set) {
    return redirectIfNotAlreadyOnPage(
      '/app/calendar/availability',
      {
        organization_id: String(availability_not_set.organization.id),
        initial: 'true',
        warning:
          'Please set your availability to be able to receive appointments',
      },
    )
  }

  return ctx.next()
}
