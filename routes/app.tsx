import { Handlers, PageProps } from '$fresh/server.ts'
import { WithSession } from 'fresh_session'
import { oauthParams } from '../external-clients/google.ts'
import { isHealthWorkerWithGoogleTokens } from '../db/models/health_workers.ts'
import redirect from '../util/redirect.ts'
import NewLayout from '../components/NewLayout.tsx'
import Tabs from '../components/Tabs.tsx'
import { TabDef } from '../types.ts'
import Recent from '../islands/recent.tsx'

const TEMP_AVATAR =
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'

export const handler: Handlers<Record<string, never>, WithSession> = {
  GET(_req, ctx) {
    const isAuthedHealthWorker = isHealthWorkerWithGoogleTokens(
      ctx.state.session.data,
    )
    const Location =
      `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?${oauthParams}`
    if (!isAuthedHealthWorker) return redirect(Location)
    return ctx.render({})
  },
}

const tabs: TabDef[] = [
  { title: 'RECENT', href: '/app' },
  { title: 'APPOINTMENTS', href: '/app/appointments', number: 654 },
  { title: 'ORDERS', href: '/app/orders', number: 2 },
]

export default function App(
  props: PageProps,
) {
  return (
    <NewLayout
      title='Good morning, Nurse!'
      route={props.route}
      imageUrl={TEMP_AVATAR}
    >
      <Tabs route={props.route} tabs={tabs} />
      <Recent />
    </NewLayout>
  )
}
