import { assert } from 'std/testing/asserts.ts'
import { PageProps } from '$fresh/server.ts'
import { isHealthWorkerWithGoogleTokens } from '../db/models/health_workers.ts'
import * as patients from '../db/models/patients.ts'
import Layout from '../components/library/Layout.tsx'
import Tabs from '../components/library/Tabs.tsx'
import {
  HealthWorkerWithGoogleTokens,
  LoggedInHealthWorkerHandler,
  Patient,
  ReturnedSqlRow,
  TrxOrDb,
} from '../types.ts'
import PatientsView from '../components/patients/View.tsx'

type RecentPatientsProps = {
  tab: 'recent'
  patients: ReturnedSqlRow<Patient & { name: string }>[]
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
  | RecentPatientsProps
  | AppointmentsProps
  | OrdersProps

type Tab = AppTypedProps['tab']

const tabs = [
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
): Promise<AppTypedProps & Pick<AppProps, 'counts'>> {
  const counts = {
    orders: 5,
    appointments: 10,
  }

  switch (tab) {
    case 'recent': {
      return {
        tab: 'recent',
        patients: await patients.getAllWithNames(trx),
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
    const healthWorker = ctx.state.session.data

    assert(isHealthWorkerWithGoogleTokens(healthWorker))

    const tabQuery = new URL(req.url).searchParams.get('tab')
    const activeTab = tabs.find((tab) => tab === tabQuery) || tabs[0]

    return ctx.render({
      healthWorker,
      ...(await fetchNeededData(ctx.state.trx, activeTab)),
    })
  },
}

export default function AppPage(
  props: PageProps<AppProps>,
) {
  return (
    <Layout
      title={`Good day, ${props.data.healthWorker.name.split(' ')[0]}!`}
      route={props.route}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='standard'
    >
      <Tabs
        route={props.route}
        tabs={tabs}
        activeTab={props.data.tab}
        counts={props.data.counts}
      />
      {props.data.tab === 'recent' && (
        <PatientsView patients={props.data.patients} />
      )}
      {props.data.tab === 'appointments' && <p>TODO: appointments</p>}
      {props.data.tab === 'orders' && <p>TODO: orders</p>}
    </Layout>
  )
}
