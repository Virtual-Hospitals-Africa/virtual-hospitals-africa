import { Handlers, PageProps } from '$fresh/server.ts'
import { WithSession } from 'fresh_session'
import { oauthParams } from '../external-clients/google.ts'
import { isHealthWorkerWithGoogleTokens } from '../db/models/health_workers.ts'
import redirect from '../util/redirect.ts'
import Layout from '../components/library/Layout.tsx'
import Tabs from '../components/library/Tabs.tsx'
import { HealthWorkerWithGoogleTokens, TabDef } from '../types.ts'
import Recent from '../islands/recent.tsx'

export const handler: Handlers<
  { healthWorker: HealthWorkerWithGoogleTokens },
  WithSession
> = {
  GET(_req, ctx) {
    const healthWorker = ctx.state.session.data

    if (!isHealthWorkerWithGoogleTokens(healthWorker)) {
      const loginUrl =
        `https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?${oauthParams}`
      return redirect(loginUrl)
    }
    return ctx.render({
      healthWorker,
    })
  },
}

const tabs: TabDef[] = [
  { title: 'RECENT', href: '/app' },
  { title: 'APPOINTMENTS', href: '/app/appointments', number: 654 },
  { title: 'ORDERS', href: '/app/orders', number: 2 },
]

export default function App(
  props: PageProps<{ healthWorker: HealthWorkerWithGoogleTokens }>,
) {
  return (
    <Layout
      title='Good morning, Nurse!'
      route={props.route}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='standard'
    >
      <Tabs route={props.route} tabs={tabs} />
      <Recent />
    </Layout>
  )
}
