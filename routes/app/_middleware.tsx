import { Context } from 'fresh'
import { deleteCookie, getCookies, setCookie } from 'std/http/cookie.ts'
import { LoggedInHealthWorker, LoggedInHealthWorkerContext } from '../../types.ts'
import { health_workers } from '../../db/models/health_workers.ts'
import { employees } from '../../db/models/employees.ts'
import { notifications } from '../../db/models/notifications.ts'
import { sessions } from '../../db/models/sessions.ts'
import redirect from '../../util/redirect.ts'
import { warning } from '../../util/alerts.ts'
import { loginHref } from '../login.tsx'
import { JSX } from 'preact/jsx-runtime'
import { promiseProps } from '../../util/promiseProps.ts'
import db from '../../db/db.ts'
import { assertOr401 } from '../../util/assertOr.ts'
import { attachTrx } from '../../backend/attachTrx.ts'
import { assert } from 'std/assert/assert.ts'
import { defaultOrganizationId } from '../../shared/defaultOrganizationId.ts'
import { HealthWorkerHomePageLayout } from '../../components/library/layout/HealthWorkerHomePage.tsx'
import { getHealthWorkerCookie, getSessionCookie, session_key } from '../../shared/session_cookie.ts'
import { __local_storage__ } from '../../backend/local_storage.ts'
import { exists } from '../../util/exists.ts'
import { timeMiddlewareCallNext } from '../../backend/timeMiddleware.ts'
import { traceTime } from '../../util/traceTime.ts'

// deno-lint-ignore no-explicit-any
function setTwaCookie(ctx: Context<any>) {
  const url = new URL(ctx.req.url)
  if (!url.searchParams.has('twa')) return
  url.searchParams.delete('twa')
  const response = redirect(url.pathname + url.search)
  setCookie(response.headers, { name: 'twa', value: '1', path: '/', maxAge: 365 * 24 * 60 * 60 })
  return response
}

export default [
  timeMiddlewareCallNext(setTwaCookie),
  timeMiddlewareCallNext(ensureSessionCookiePresent),
  timeMiddlewareCallNext(setSidebarCollapsed),
  timeMiddlewareCallNext(getLoggedInHealthWorker({ require_employment: true })),
  timeMiddlewareCallNext(attachTrx),
]

export const could_not_locate_account_href = warning(
  "Could not locate your account. Please try logging in once more. If this issue persists, please contact your organization's administrator.",
)

export function noSession() {
  const response = redirect(could_not_locate_account_href)
  deleteCookie(response.headers, session_key)
  deleteCookie(response.headers, 'health_worker_id')
  return response
}

// deno-lint-ignore no-explicit-any
export function ensureSessionCookiePresent(ctx: Context<any>) {
  if (!getSessionCookie(ctx.req)) {
    return noSession()
  }
  if (!getHealthWorkerCookie(ctx.req)) {
    return noSession()
  }
}

function setSidebarCollapsed(ctx: Context<unknown>) {
  const sidebar_collapsed = getCookies(ctx.req.headers)['sidebar_collapsed'] === 'true'
  const store = exists(__local_storage__.getStore())
  store.sidebar_collapsed = sidebar_collapsed
}

function isGettingHtml(req: Request) {
  if (req.method !== 'GET') return false
  const accept = req.headers.get('accept')
  if (!accept) return false
  const accepts = accept.split(',')
  return accepts.includes('text/html')
}

export function getLoggedInHealthWorker(
  { require_employment }: { require_employment: boolean },
) {
  return async function getLoggedInHealthWorkerScoped(
    // deno-lint-ignore no-explicit-any
    ctx: Context<any>,
  ) {
    const session_id = getSessionCookie(ctx.req)
    assert(session_id)
    const health_worker_id = getHealthWorkerCookie(ctx.req)
    assert(health_worker_id)

    const { health_worker, present_encounter } = await promiseProps({
      present_encounter: traceTime(
        'present_encounter',
        db.selectFrom('employment')
          .innerJoin('patient_encounter_employees', 'patient_encounter_employees.employment_id', 'employment.id')
          .innerJoin('patient_encounters', 'patient_encounter_employees.patient_encounter_id', 'patient_encounters.id')
          .innerJoin('employment_presence', 'employment.id', 'employment_presence.id')
          .where('employment.health_worker_id', '=', health_worker_id)
          .where('patient_encounters.closed_at', 'is', null)
          .whereRef('patient_encounters.patient_id', '=', 'employment_presence.with_patient_id')
          .select('patient_encounters.id')
          .executeTakeFirst(),
      ),
      update_session: traceTime('sessions.tickUpdatedAt', sessions.tickUpdatedAt(db, { session_id, health_worker_id })),
      health_worker: traceTime(
        'health_workers.getByIdOptional',
        health_workers.getByIdOptional(
          db,
          health_worker_id,
        ),
      ),
    })

    if (
      health_worker && (
        !require_employment || health_workers.isEmployed(health_worker)
      )
    ) {
      const logged_in_health_worker: LoggedInHealthWorker = {
        session_id,
        health_worker,
        health_worker_id: health_worker.id,
        present_encounter_id: present_encounter?.id || null,
      }
      Object.assign(ctx.state, logged_in_health_worker)
      return
    }

    assertOr401(isGettingHtml(ctx.req))

    const from_login = ctx.url.searchParams.has('from_login')
    const response = from_login ? redirect(loginHref()) : noSession()
    deleteCookie(response.headers, session_key)
    deleteCookie(response.headers, 'health_worker_id')
    return response
  }
}

type RenderedSeparately = {
  drawer?: JSX.Element
  title?: string
  children: JSX.Element
}

type RenderedSeparatelyWithTitle = RenderedSeparately & {
  title: string
}

export function HealthWorkerHomePage<
  // deno-lint-ignore no-explicit-any
  Context extends LoggedInHealthWorkerContext<any>,
>(
  title:
    | string
    | ((
      ctx: Context,
    ) =>
      | Response
      | RenderedSeparatelyWithTitle
      | Promise<RenderedSeparatelyWithTitle | Response>),
  render?: (
    ctx: Context,
  ) =>
    | JSX.Element
    | RenderedSeparately
    | Promise<JSX.Element>
    | Promise<Response>
    | Promise<JSX.Element | Response>
    | Promise<RenderedSeparately | Response>,
) {
  return async function (
    ctx: Context,
  ) {
    const { health_worker, trx } = ctx.state
    if (typeof title === 'function') {
      // deno-lint-ignore no-explicit-any
      render = title as any
      // deno-lint-ignore no-explicit-any
      title = undefined as any
    }

    let { rendered /*, health_worker_notifications*/ } = await promiseProps({
      rendered: Promise.resolve(
        render!(ctx),
      ),
      health_worker_notifications: notifications.ofHealthWorker(
        trx,
        health_worker.id,
      ),
    })

    let drawer: JSX.Element | undefined
    if (rendered instanceof Response) {
      return rendered
    }
    if ('drawer' in rendered) {
      drawer = rendered.drawer
    }
    if ('title' in rendered) {
      title = rendered.title as string
    }
    if ('children' in rendered) {
      rendered = rendered.children
    }

    return (
      <HealthWorkerHomePageLayout
        title={title as string}
        url={ctx.url}
        route={ctx.route!}
        employee={employees.fromHealthWorker(
          ctx.state.health_worker,
          ctx.params.organization_id,
        )}
        params={ctx.params && 'organization_id' in ctx.params ? ctx.params : {
          ...ctx.params,
          organization_id: defaultOrganizationId(ctx.state.health_worker),
        }}
        drawer={drawer}
      >
        {rendered}
      </HealthWorkerHomePageLayout>
    )
  }
}
