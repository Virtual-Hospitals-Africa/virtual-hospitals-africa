import { assert } from 'std/assert/assert.ts'
import { PageProps } from '$fresh/server.ts'
import * as patients from '../db/models/patients.ts'
import * as waiting_room from '../db/models/waiting_room.ts'
import Layout from '../components/library/Layout.tsx'
import { activeTab, Tabs } from '../components/library/Tabs.tsx'
import {
  HealthWorkerWithGoogleTokens,
  LoggedInHealthWorkerHandler,
  Maybe,
  RenderedPatient,
  RenderedWaitingRoom,
  TrxOrDb,
} from '../types.ts'
import WaitingRoomView from '../components/waiting-room/View.tsx'
import PatientsView from '../components/patients/View.tsx'
import { firstName } from '../util/name.ts'
import redirect from '../util/redirect.ts'

type WaitingRoomProps = {
  tab: 'waiting_room'
  facility_id: number
  waiting_room: RenderedWaitingRoom[]
}

type RecentPatientsProps = {
  tab: 'recent'
  patients: RenderedPatient[]
}

type AppointmentsProps = {
  tab: 'appointments'
  appointments: unknown
}

type OrdersProps = {
  tab: 'orders'
  orders: unknown
}

type AppTypedProps =
  | WaitingRoomProps
  | RecentPatientsProps
  | AppointmentsProps
  | OrdersProps

type Tab = AppTypedProps['tab']

const tabs = [
  'waiting_room' as const,
  'recent' as const,
  'appointments' as const,
  'orders' as const,
]

type AppProps = {
  healthWorker: HealthWorkerWithGoogleTokens
  counts: Partial<Record<Tab, number>>
} & AppTypedProps

async function fetchNeededData(
  trx: TrxOrDb,
  tab: AppTypedProps['tab'],
  search?: Maybe<string>,
  facility_id?: number,
): Promise<AppTypedProps & Pick<AppProps, 'counts'>> {
  const counts = {
    orders: 5,
    appointments: 10,
  }

  switch (tab) {
    case 'waiting_room': {
      assert(facility_id)
      return {
        tab: 'waiting_room',
        facility_id,
        waiting_room: await waiting_room.get(trx, { facility_id }),
        counts,
      }
    }
    case 'recent': {
      return {
        tab: 'recent',
        patients: await patients.getAllWithNames(trx, search),
        counts,
      }
    }
    case 'appointments': {
      return {
        tab: 'appointments',
        appointments: [],
        counts,
      }
    }
    case 'orders':
      return {
        tab: 'orders',
        orders: [],
        counts,
      }
  }
}

export const handler: LoggedInHealthWorkerHandler<AppProps> = {
  async GET(req, ctx) {
    const { employment } = ctx.state.healthWorker
    assert(
      employment.length,
      'must be employed at at least one facility',
    )
    const { searchParams } = new URL(req.url)

    const tab = activeTab(tabs, req.url)

    // facility_id is required for waiting_room tab
    let facility_id = parseInt(searchParams.get('facility_id')!) || undefined
    if (facility_id && !employment.some((e) => e.facility.id === facility_id)) {
      searchParams.set('facility_id', employment[0].facility.id.toString())
      return redirect(`/app?${searchParams.toString()}`)
    }
    if (tab === 'waiting_room' && !facility_id) {
      if (employment.length > 1) {
        console.warn('TODO: select facility?')
        searchParams.set('facility_id', employment[0].facility.id.toString())
        return redirect(`/app?${searchParams.toString()}`)
      }
      facility_id = employment[0].facility.id
    }

    const search = searchParams.get('search')

    return ctx.render({
      healthWorker: ctx.state.healthWorker,
      ...(await fetchNeededData(ctx.state.trx, tab, search, facility_id)),
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
        activeTab={props.data.tab}
        counts={props.data.counts}
      />
      {props.data.tab === 'waiting_room' && (
        <WaitingRoomView
          facility_id={props.data.facility_id}
          waiting_room={props.data.waiting_room}
        />
      )}
      {props.data.tab === 'recent' && (
        <PatientsView patients={props.data.patients} />
      )}
      {props.data.tab === 'appointments' && <p>TODO: appointments</p>}
      {props.data.tab === 'orders' && <p>TODO: orders</p>}
    </Layout>
  )
}
