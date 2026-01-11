import { Context } from 'fresh'
import { LoggedInRegulatorContext } from '../../types.ts'
import { regulators } from '../../db/models/regulators.ts'
import redirect from '../../util/redirect.ts'
import { assert } from 'std/assert/assert.ts'
import { deleteCookie } from 'std/http/cookie.ts'
import * as cookie from '../../shared/cookie.ts'
import { loginHref } from '../login.tsx'
import { JSX } from 'preact/jsx-runtime'
import { promiseProps } from '../../util/promiseProps.ts'
import { attachTrx } from '../../backend/attachTrx.ts'
import { warning } from '../../util/alerts.ts'
import db from '../../db/db.ts'
import HealthWorkerContentsWithSidebarAndDrawer from '../../components/library/layout/HealthWorkerContentsWithSidebarAndDrawer.tsx'
import { RegulatorHomePageSidebar } from '../../components/library/Sidebar.tsx'

export default [
  ensureCookiePresent,
  getLoggedInRegulator,
  attachTrx,
  redirectIfAtRoot,
]

export const could_not_locate_account_href = warning(
  "Could not locate your account. Please try logging in once more. If this issue persists, please contact your organization's administrator.",
)
function noSession() {
  return redirect(could_not_locate_account_href)
}

function ensureCookiePresent(ctx: Context<unknown>) {
  return cookie.get(ctx.req) ? ctx.next() : noSession()
}

function redirectIfAtRoot(ctx: LoggedInRegulatorContext) {
  return ctx.url.pathname === '/regulator' ? redirect(`/regulator/${ctx.state.regulator.country}/pharmacists`) : ctx.next()
}

async function getLoggedInRegulator(
  ctx: LoggedInRegulatorContext,
) {
  const session_id = cookie.get(ctx.req)
  assert(session_id)

  const regulator = await regulators.getBySession(db, {
    session_id,
  })

  if (!regulator) {
    const from_login = ctx.url.searchParams.has('from_login')
    const response = from_login ? redirect(loginHref()) : noSession()
    deleteCookie(response.headers, cookie.session_key)
    return response
  }

  ctx.state.regulator = regulator
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

export function RegulatorHomePageLayout<
  Context extends LoggedInRegulatorContext,
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
    // const { regulator } = ctx.state
    if (typeof title === 'function') {
      // deno-lint-ignore no-explicit-any
      render = title as any
      // deno-lint-ignore no-explicit-any
      title = undefined as any
    }

    let { rendered } = await promiseProps({
      rendered: Promise.resolve(
        render!(ctx),
      ),
      // regulator_notifications: notifications.ofRegulator(
      //   trx,
      //   Regulator.id,
      // ),
    })

    if (rendered instanceof Response) {
      return rendered
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
          <RegulatorHomePageSidebar
            route={ctx.route!}
            params={ctx.params || {}}
            urlSearchParams={ctx.url.searchParams}
          />
        }
      >
        {rendered}
      </HealthWorkerContentsWithSidebarAndDrawer>
    )
  }
}
