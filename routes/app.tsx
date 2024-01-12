import { assert } from 'std/assert/assert.ts'
import { PageProps } from '$fresh/server.ts'
import * as waiting_room from '../db/models/waiting_room.ts'
import * as appointments from '../db/models/appointments.ts'
import Layout from '../components/library/Layout.tsx'
import { activeTab, Tabs, TabsProps } from '../components/library/Tabs.tsx'
import {
  HealthWorkerWithGoogleTokens,
  LoggedInHealthWorkerHandler,
  RenderedWaitingRoom,
} from '../types.ts'
import WaitingRoomView from '../components/waiting-room/View.tsx'
import { firstName } from '../util/name.ts'
import redirect from '../util/redirect.ts'
import { getNumericParam } from '../util/getNumericParam.ts'

type Tab = 'waiting_room' | 'appointments' | 'orders'

const tabs: TabsProps<Tab>['tabs'] = [
  'waiting_room' as const,
  ['appointments' as const, '/app/calendar'],
  ['orders' as const, '/app/orders'],
]

type AppProps = {
  healthWorker: HealthWorkerWithGoogleTokens
  counts: Partial<Record<Tab, number>>
  facility_id: number
  waiting_room: RenderedWaitingRoom[]
}

export const handler: LoggedInHealthWorkerHandler<AppProps> = {
  async GET(req, ctx) {
    const { employment } = ctx.state.healthWorker
    assert(
      employment.length,
      'must be employed at at least one facility',
    )
    const { searchParams } = new URL(req.url)

    // We may revisit this, but for now there's only one tab
    // that actually displays on this page, the waiting room
    // while the rest link out to other pages
    // const tab = activeTab(tabs, req.url)

    let facility_id = getNumericParam(searchParams, 'facility_id')
    if (facility_id && !employment.some((e) => e.facility.id === facility_id)) {
      searchParams.set('facility_id', employment[0].facility.id.toString())
      return redirect(`/app?${searchParams.toString()}`)
    }
    if (!facility_id) {
      if (employment.length > 1) {
        console.warn('TODO: select facility?')
        searchParams.set('facility_id', employment[0].facility.id.toString())
        return redirect(`/app?${searchParams.toString()}`)
      }
      facility_id = employment[0].facility.id
    }
    assert(facility_id)

    const getting_waiting_room = waiting_room.get(ctx.state.trx, {
      facility_id,
    })
    const getting_appointments_count = appointments.countUpcoming(
      ctx.state.trx,
      {
        health_worker_id: ctx.state.healthWorker.id,
      },
    )

    return ctx.render({
      healthWorker: ctx.state.healthWorker,
      facility_id,
      waiting_room: await getting_waiting_room,
      counts: {
        appointments: await getting_appointments_count,
      },
    })
  },
}

export default function AppPage(
  props: PageProps<AppProps>,
) {
  return (
    <Layout
      title={`Good day, ${firstName(props.data.healthWorker.name)}!`}
      route={props.route}
      url={props.url}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='home page'
    >
      <Tabs
        route={props.route}
        tabs={tabs}
        activeTab='waiting_room'
        counts={props.data.counts}
      />
      <WaitingRoomView
        facility_id={props.data.facility_id}
        waiting_room={props.data.waiting_room}
      />
    </Layout>
  )
}
