import { assert } from 'std/testing/asserts.ts'
import { PageProps } from '$fresh/server.ts'
import {
  HealthWorker,
  LoggedInHealthWorkerHandler,
  ReturnedSqlRow,
} from '../../types.ts'
import HealthWorkerTable from '../../components/health_worker/Table.tsx'
import * as health_workers from '../../db/models/health_workers.ts'
import Layout from '../../components/library/Layout.tsx'

type EmployeesPageProps = {
  isAdmin: boolean
  healthWorker: ReturnedSqlRow<HealthWorker>
}

export const handler: LoggedInHealthWorkerHandler<EmployeesPageProps> = {
  async GET(_req, ctx) {
    const healthWorker = ctx.state.session.data
    assert(
      health_workers.isHealthWorkerWithGoogleTokens(healthWorker),
      'Invalid health worker',
    )
    const isAdmin = await health_workers.isAdmin(
      ctx.state.trx,
      { id: healthWorker.id },
    )
    return ctx.render({ isAdmin, healthWorker })
  },
}

export default function EmployeesPage(
  props: PageProps<EmployeesPageProps>,
) {
  return (
    <Layout
      title='Employees'
      route={props.route}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='standard'
    >
      <HealthWorkerTable
        isAdmin={props.data.isAdmin}
        employees={[
          {
            name: 'jon doe',
            profession: 'nurse',
            email: '123@gmail.com',
            facility: 'clinicA',
          },
          {
            name: 'bob smith',
            profession: 'doctor',
            email: 'bob@gmail.com',
            facility: 'clinicB',
          },
        ]}
      />
    </Layout>
  )
}
