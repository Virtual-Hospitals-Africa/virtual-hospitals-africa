import { JSX } from 'preact/jsx-runtime'
import { LoggedInHealthWorkerContext } from '../../../types.ts'
import { timeMiddlewareCallNext } from '../../../backend/timeMiddleware.ts'
import HealthWorkerContentsWithSidebarAndDrawer from '../../../components/library/layout/HealthWorkerContentsWithSidebarAndDrawer.tsx'
import { SuperadminHomePageSidebar } from '../../../components/library/sidebar/SuperadminHomePage.tsx'

const superadmin_emails = (Deno.env.get('SUPERADMIN_EMAILS') || '').split(',').map((e) => e.trim()).filter(Boolean)

function ensureSuperadmin(ctx: LoggedInHealthWorkerContext) {
  const email = ctx.state.health_worker.email
  if (!email || !superadmin_emails.includes(email)) {
    return new Response('Forbidden', { status: 403 })
  }
}

export default [
  timeMiddlewareCallNext(ensureSuperadmin),
]

export function SuperadminPage(
  render: (
    ctx: LoggedInHealthWorkerContext,
  ) => { title: string; children: JSX.Element } | Promise<{ title: string; children: JSX.Element }>,
) {
  return async function (ctx: LoggedInHealthWorkerContext) {
    const { title, children } = await render(ctx)
    return (
      <HealthWorkerContentsWithSidebarAndDrawer
        title={title}
        url={ctx.url}
        sidebar={
          <SuperadminHomePageSidebar
            route={ctx.route!}
            params={ctx.params}
            urlSearchParams={ctx.url.searchParams}
          />
        }
        footer={<div>TODO</div>}
      >
        <div className='px-4'>{children}</div>
      </HealthWorkerContentsWithSidebarAndDrawer>
    )
  }
}
