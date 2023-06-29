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
  { name: 'recent' },
  { name: 'appointments', count: 654 },
  { name: 'orders', count: 2 },
]

export default function App(
  props: PageProps<{ healthWorker: HealthWorkerWithGoogleTokens }>,
) {
  const tabQuery = new URL(props.url).searchParams.get('tab')
  const activeTab = tabs.find((tab) => tab.name === tabQuery) || tabs[0]
  return (
    <Layout
      title={`Good day, ${props.data.healthWorker.name.split(' ')[0]}!`}
      route={props.route}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='standard'
    >
      <Tabs route={props.route} tabs={tabs} activeTab={activeTab} />
      {activeTab.name === 'recent' && <Recent />}
      {activeTab.name === 'appointments' && <p>TODO: appointments</p>}
      {activeTab.name === 'orders' && <p>TODO: orders</p>}
    </Layout>
  )
}
