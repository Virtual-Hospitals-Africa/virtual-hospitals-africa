import { assert } from 'std/assert/assert.ts'
import { FreshContext } from '$fresh/server.ts'
import * as waiting_room from '../db/models/waiting_room.ts'
import * as appointments from '../db/models/appointments.ts'
import Layout from '../components/library/Layout.tsx'
import { TabProps, Tabs } from '../components/library/Tabs.tsx'
import { LoggedInHealthWorker } from '../types.ts'
import WaitingRoomView from '../components/waiting_room/View.tsx'
import { firstName } from '../util/name.ts'
import redirect from '../util/redirect.ts'
import { getNumericParam } from '../util/getNumericParam.ts'
import Badge from '../components/library/Badge.tsx'

export default async function AppPage(
  _req: Request,
  ctx: FreshContext<LoggedInHealthWorker>,
) {
  const { healthWorker, trx } = ctx.state
  const { searchParams } = ctx.url

  // We may revisit this, but for now there's only one tab
  // that actually displays on this page, the waiting room
  // while the rest link out to other pages
  let facility_id = getNumericParam(searchParams, 'facility_id')
  if (
    facility_id &&
    !healthWorker.employment.some((e) => e.facility.id === facility_id)
  ) {
    searchParams.set('facility_id', healthWorker.default_facility_id.toString())
    return redirect(`/app?${searchParams.toString()}`)
  }
  if (!facility_id) {
    if (healthWorker.employment.length > 1) {
      console.warn('TODO: select facility?')
      searchParams.set(
        'facility_id',
        healthWorker.default_facility_id.toString(),
      )
      return redirect(`/app?${searchParams.toString()}`)
    }
    facility_id = healthWorker.default_facility_id
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

  const tabs: TabProps[] = [
    {
      tab: 'waiting_room',
      href: `/app`,
      active: true,
    },
    {
      tab: 'appointments',
      href: '/app/calendar',
      active: false,
      rightIcon: <Badge content={await getting_appointments_count} />,
    },
    {
      tab: 'orders',
      href: '/app/calendar',
      active: false,
    },
  ]

  return (
    <Layout
      variant='home page'
      title={`Good day, ${firstName(healthWorker.name)}!`}
      route={ctx.route}
      url={ctx.url}
      params={ctx.params}
      health_worker={healthWorker}
    >
      <Tabs tabs={tabs} />
      <WaitingRoomView
        facility_id={facility_id}
        waiting_room={await getting_waiting_room}
      />
    </Layout>
  )
}
