import { PageProps } from '$fresh/server.ts'
import Layout from '../../../../../components/library/Layout.tsx'
import {
  HealthWorker,
  LoggedInHealthWorkerHandler,
  ReturnedSqlRow,
} from '../../../../../types.ts'
import * as health_workers from '../..../../../../../../db/models/health_workers.ts'
import { assert } from 'std/testing/asserts.ts'
import parseForm from '../../../../../util/parseForm.ts'
import InviteEmployeesForm from '../../../../../islands/invites-form.tsx'

type EmployeesPageProps = {
  healthWorker: ReturnedSqlRow<HealthWorker>
}

export const handler: LoggedInHealthWorkerHandler<EmployeesPageProps> = {
  async GET(req, ctx) {
    const healthWorker = ctx.state.session.data
    const facilityId = parseInt(ctx.params.facilityId)
    assert(facilityId)
    assert(health_workers.isHealthWorkerWithGoogleTokens(healthWorker))
    const isAdmin = await health_workers.isAdmin(
      ctx.state.trx,
      {
        employee_id: healthWorker.id,
        facility_id: facilityId,
      },
    )
    assert(isAdmin)
    assert(facilityId)
    return ctx.render({ healthWorker })
  },
  async POST(req, ctx) {
    console.log('DID WE GET IN HERE')
    const healthWorker = ctx.state.session.data

    assert(health_workers.isHealthWorkerWithGoogleTokens(healthWorker))
    const isAdmin = await health_workers.isAdmin(
      ctx.state.trx,
      {
        employee_id: healthWorker.id,
        facility_id: parseInt(ctx.params.facilityId),
      },
    )

    assert(isAdmin)

    const facilityId = parseInt(ctx.params.facilityId)
    assert(facilityId)

    console.log(`Inviting user to facility ${facilityId}`)

    const params = new URLSearchParams(await req.text())

    const values = parseForm(params, [])
    console.log('values', values)
    return new Response('OK')
  },
}

export default function InviteEmployees(props: PageProps) {
  return (
    <Layout
      title='Invite Employees'
      route={props.route}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='standard'
    >
      <InviteEmployeesForm />
    </Layout>
  )
}
