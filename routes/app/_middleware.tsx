import { Context } from 'fresh'
import { LoggedInHealthWorkerContext } from '../../types.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import * as notifications from '../../db/models/notifications.ts'
import redirect from '../../util/redirect.ts'
import { deleteCookie } from 'std/http/cookie.ts'
import * as cookie from '../../shared/cookie.ts'
import { warning } from '../../util/alerts.ts'
import { login_href } from '../login.tsx'
import { JSX } from 'preact/jsx-runtime'
import { promiseProps } from '../../util/promiseProps.ts'
import Layout from '../../components/library/Layout.tsx'
import db from '../../db/db.ts'
import { assertOr401 } from '../../util/assertOr.ts'
import { attachTrx } from '../../shared/attachTrx.ts'
import { assert } from 'std/assert/assert.ts'

const SKIP_NURSE_REGISTRATION = true

export const handler = [
  ensureCookiePresent,
  getLoggedInHealthWorker({ require_employment: true }),
  redirectIfRegistrationNeeded,
  attachTrx,
]

export const could_not_locate_account_href = warning(
  "Could not locate your account. Please try logging in once more. If this issue persists, please contact your organization's administrator.",
)

export function noSession() {
  return redirect(could_not_locate_account_href)
}

// deno-lint-ignore no-explicit-any
export function ensureCookiePresent(ctx: Context<any>) {
  return cookie.get(ctx.req) ? ctx.next() : noSession()
}

export function getLoggedInHealthWorkerFromCookie(
  // deno-lint-ignore no-explicit-any
  ctx: Context<any>,
) {
  const session_id = cookie.get(ctx.req)
  assert(session_id)
  return health_workers.getBySession(db, { session_id })
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
  return async function (
    // deno-lint-ignore no-explicit-any
    ctx: Context<any>,
  ) {
    const health_worker = await getLoggedInHealthWorkerFromCookie(ctx)

    if (
      health_worker && (
        !require_employment || health_workers.isEmployed(health_worker)
      )
    ) {
      ctx.state.health_worker = health_worker
      return ctx.next()
    }

    assertOr401(isGettingHtml(ctx.req))

    const from_login = ctx.url.searchParams.has('from_login')
    const response = from_login ? redirect(login_href) : noSession()
    deleteCookie(response.headers, cookie.session_key)
    return response
  }
}

function redirectIfRegistrationNeeded(
  ctx: LoggedInHealthWorkerContext,
) {
  const { health_worker } = ctx.state
  const role_needing_registration = health_worker.employment.find((e) =>
    e.roles.nurse?.registration_needed || e.roles.doctor?.registration_needed ||
    e.roles.admin?.registration_needed
  )

  // This is not quite right as this will mean that you can't log in if you're pending approval at one organization, even if you're not
  // pending approval at another but not at another.
  // TODO deal with this as part of doctor registration
  const role_pending_approval = health_worker.employment.find((e) =>
    e.roles.nurse?.registration_pending_approval ||
    e.roles.doctor?.registration_pending_approval ||
    e.roles.admin?.registration_pending_approval
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

  if (role_needing_registration && !SKIP_NURSE_REGISTRATION) {
    return redirectIfNotAlreadyOnPage(
      `/app/organizations/${role_needing_registration.organization.id}/register`,
    )
  }

  // TODO make a page for this purpose
  if (role_pending_approval && !SKIP_NURSE_REGISTRATION) {
    return redirectIfNotAlreadyOnPage('/app/pending_approval')
  }

  return ctx.next()
}

type RenderedSeparately = {
  drawer?: JSX.Element
  title?: string
  children: JSX.Element
}

type RenderedSeparatelyWithTitle = RenderedSeparately & {
  title: string
}

export function HealthWorkerHomePageLayout<
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

    let { rendered, health_worker_notifications } = await promiseProps({
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
      <Layout
        variant='health worker home page'
        title={title as string}
        route={ctx.route!}
        url={ctx.url}
        health_worker={health_worker}
        notifications={health_worker_notifications}
        drawer={drawer}
      >
        {rendered}
      </Layout>
    )
  }
}
