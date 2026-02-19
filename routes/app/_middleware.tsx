import { Context } from 'fresh'
import { deleteCookie } from 'std/http/cookie.ts'
import { LoggedInHealthWorkerContext } from '../../types.ts'
import { health_workers } from '../../db/models/health_workers.ts'
import { employees } from '../../db/models/employees.ts'
import { patient_encounters } from '../../db/models/patient_encounters.ts'
import { notifications } from '../../db/models/notifications.ts'
import { sessions } from '../../db/models/sessions.ts'
import redirect from '../../util/redirect.ts'
import * as cookie from '../../shared/cookie.ts'
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

export default [
  ensureCookiePresent,
  getLoggedInHealthWorker({ require_employment: true }),
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
    const session_id = cookie.get(ctx.req)
    assert(session_id)

    const health_worker_id_selection = sessions.getHealthWorkerId(
      db,
      session_id,
    )

    const { health_worker, present_encounter } = await promiseProps({
      update_session: sessions.tickUpdatedAt(db, session_id),
      health_worker: health_workers.getByIdOptional(
        db,
        health_worker_id_selection,
      ),
      present_encounter: patient_encounters.findOneOptional(db, {
        is_open: true,
        presence_health_worker_id: health_worker_id_selection,
      }),
    })

    if (
      health_worker && (
        !require_employment || health_workers.isEmployed(health_worker)
      )
    ) {
      ctx.state.session_id = session_id
      ctx.state.health_worker = health_worker
      ctx.state.health_worker_id = health_worker.id
      ctx.state.present_encounter = present_encounter
      return ctx.next()
    }

    assertOr401(isGettingHtml(ctx.req))

    const from_login = ctx.url.searchParams.has('from_login')
    const response = from_login ? redirect(loginHref()) : noSession()
    deleteCookie(response.headers, cookie.session_key)
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
