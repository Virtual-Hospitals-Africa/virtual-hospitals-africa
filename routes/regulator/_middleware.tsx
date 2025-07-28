import { FreshContext } from '$fresh/server.ts'
import { LoggedInRegulatorContext } from '../../types.ts'
import * as regulators from '../../db/models/regulators.ts'
import redirect from '../../util/redirect.ts'
import { assert } from 'std/assert/assert.ts'
import { deleteCookie } from 'std/http/cookie.ts'
import * as cookie from '../../shared/cookie.ts'
import { startTrx } from '../../shared/startTrx.ts'
import { warning } from '../../util/alerts.ts'
import { login_href } from '../login.tsx'
import { JSX } from 'preact/jsx-runtime'
import { promiseProps } from '../../util/promiseProps.ts'
import Layout from '../../components/library/Layout.tsx'

export const handler = [
  ensureCookiePresent,
  startTrx,
  getLoggedInRegulator,
  redirectIfAtRoot,
]

export const could_not_locate_account_href = warning(
  "Could not locate your account. Please try logging in once more. If this issue persists, please contact your organization's administrator.",
)
function noSession() {
  return redirect(could_not_locate_account_href)
}

function ensureCookiePresent(req: Request, ctx: FreshContext) {
  return cookie.get(req) ? ctx.next() : noSession()
}

function redirectIfAtRoot(req: Request, ctx: LoggedInRegulatorContext) {
  return req.url === '/regulator'
    ? redirect(`/regulator/${ctx.state.regulator.country}/pharmacists`)
    : ctx.next()
}

async function getLoggedInRegulator(
  req: Request,
  ctx: LoggedInRegulatorContext,
) {
  const session_id = cookie.get(req)
  assert(session_id)

  const regulator = await regulators.getBySession(ctx.state.trx, {
    session_id,
  })

  if (!regulator) {
    const from_login = ctx.url.searchParams.has('from_login')
    const response = from_login ? redirect(login_href) : noSession()
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
      req: Request,
      ctx: Context,
    ) =>
      | Response
      | RenderedSeparatelyWithTitle
      | Promise<RenderedSeparatelyWithTitle | Response>),
  render?: (
    req: Request,
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
    req: Request,
    ctx: Context,
  ) {
    const { regulator } = ctx.state
    if (typeof title === 'function') {
      // deno-lint-ignore no-explicit-any
      render = title as any
      // deno-lint-ignore no-explicit-any
      title = undefined as any
    }

    let { rendered } = await promiseProps({
      rendered: Promise.resolve(
        render!(req, ctx),
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
      <Layout
        variant='regulator home page'
        title={title as string}
        route={ctx.route}
        url={ctx.url}
        regulator={regulator}
        params={ctx.params}
      >
        {rendered}
      </Layout>
    )
  }
}
