import { Context } from 'fresh'
import { deleteCookie } from 'std/http/cookie.ts'
import { LoggedInHealthWorkerContext } from '../../types.ts'
import * as health_workers from '../../db/models/health_workers.ts'
import * as employees from '../../db/models/employees.ts'
import * as health_worker_registration_status from '../../db/models/health_worker_registration_status.ts'
import * as patient_encounters from '../../db/models/patient_encounters.ts'
import * as notifications from '../../db/models/notifications.ts'
import * as sessions from '../../db/models/sessions.ts'
import redirect from '../../util/redirect.ts'
import * as cookie from '../../shared/cookie.ts'
import { warning } from '../../util/alerts.ts'
import { loginHref } from '../login.tsx'
import { JSX } from 'preact/jsx-runtime'
import { promiseProps } from '../../util/promiseProps.ts'
import db from '../../db/db.ts'
import { assertOr401 } from '../../util/assertOr.ts'
import { attachTrx } from '../../shared/attachTrx.ts'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { SKIP_NURSE_REGISTRATION } from '../../db/models/health_worker_registration_status.ts'
import HealthWorkerContentsWithSidebarAndDrawer from '../../components/library/layout/HealthWorkerContentsWithSidebarAndDrawer.tsx'
import { HealthWorkerHomePageSidebar } from '../../components/library/Sidebar.tsx'
import { defaultOrganizationId } from '../../shared/defaultOrganizationId.ts'
import { HealthWorkerSidebarBottom } from '../../components/library/HealthWorkerSidebarBottom.tsx'

export default [
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
      update_session: sessions.tickUpdatedAt(db, 'health_worker', session_id),
      health_worker: health_workers.getByIdOptional(
        db,
        health_worker_id_selection,
      ),
      present_encounter: patient_encounters.findOneOptional(db, {
        is_open: true,
        presence_health_worker_id: health_worker_id_selection,
      }),
      registration_status: health_worker_registration_status.getByIdOptional(
        db,
        health_worker_id_selection,
      ),
    })

    if (
      health_worker && (
        !require_employment || health_workers.isEmployed(health_worker)
      )
    ) {
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

function redirectIfRegistrationNeeded(
  ctx: LoggedInHealthWorkerContext,
) {
  assertEquals(
    SKIP_NURSE_REGISTRATION,
    true,
    'Expecting registration to be skipped for now',
  )
  // function redirectIfNotAlreadyOnPage(
  //   page: string,
  //   params?: Record<string, string>,
  // ) {
  //   const current_url = ctx.url.pathname + ctx.url.search
  //   const on_page = current_url.startsWith(page)
  //   return on_page
  //     ? ctx.next()
  //     : redirect(params ? `${page}?${new URLSearchParams(params)}` : page)
  // }

  // const { registration_status } = ctx.state

  // if (role_needing_registration) {
  //   return redirectIfNotAlreadyOnPage(
  //     `/app/organizations/${role_needing_registration.organization.id}/register`,
  //   )
  // }

  // if (role_pending_approval) {
  //   return redirectIfNotAlreadyOnPage('/app/pending_approval')
  // }

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
      <HealthWorkerContentsWithSidebarAndDrawer
        title={title as string}
        url={ctx.url}
        sidebar={
          <HealthWorkerHomePageSidebar
            route={ctx.route!}
            params={ctx.params && 'organization_id' in ctx.params
              ? ctx.params
              : {
                ...ctx.params,
                organization_id: defaultOrganizationId(ctx.state.health_worker),
              }}
            urlSearchParams={ctx.url.searchParams}
            bottom={
              <HealthWorkerSidebarBottom
                employee={employees.fromHealthWorker(
                  ctx.state.health_worker,
                  ctx.params.organization_id,
                )}
              />
            }
          />
        }
        drawer={drawer}
      >
        <div className='px-4'>{rendered}</div>
      </HealthWorkerContentsWithSidebarAndDrawer>
    )
  }
}
