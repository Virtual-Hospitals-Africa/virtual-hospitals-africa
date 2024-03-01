import { assert } from 'std/assert/assert.ts'
import { FreshContext } from '$fresh/server.ts'
import * as waiting_room from '../db/models/waiting_room.ts'
import * as appointments from '../db/models/appointments.ts'
import Layout from '../components/library/Layout.tsx'
import { Tabs, TabsProps } from '../components/library/Tabs.tsx'
import { LoggedInHealthWorker } from '../types.ts'
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

export default async function AppPage(
  _req: Request,
  ctx: FreshContext<LoggedInHealthWorker>,
) {
  const { healthWorker, trx } = ctx.state
  const { employment } = ctx.state.healthWorker
  assert(
    employment.length,
    'must be employed at at least one facility',
  )
  const { searchParams } = ctx.url

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

  const getting_waiting_room = waiting_room.get(trx, {
    facility_id,
  })
  const getting_appointments_count = appointments.countUpcoming(
    trx,
    {
      health_worker_id: healthWorker.id,
    },
  )

  return (
    <Layout
      title={`Good day, ${firstName(healthWorker.name)}!`}
      route={ctx.route}
      url={ctx.url}
      params={{
        ...ctx.params,
        facility_id: facility_id.toString(),
      }}
      avatarUrl={healthWorker.avatar_url}
      variant='home page'
    >
      <Tabs
        route={ctx.route}
        tabs={tabs}
        activeTab='waiting_room'
        counts={{
          appointments: await getting_appointments_count,
        }}
      />
      <WaitingRoomView
        facility_id={facility_id}
        waiting_room={await getting_waiting_room}
      />
    </Layout>
  )
}
