import { PageProps } from '$fresh/server.ts'
import Layout from '../../../../../components/library/Layout.tsx'
import {
  HealthWorker,
  LoggedInHealthWorkerHandler,
  Profession,
  ReturnedSqlRow,
} from '../../../../../types.ts'
import * as health_workers from '../..../../../../../../db/models/health_workers.ts'
import { assert } from 'std/testing/asserts.ts'
import { parseRequest } from '../../../../../util/parseForm.ts'
import InviteEmployeesForm from '../../../../../islands/invites-form.tsx'
import { SmtpClient, ConnectConfigWithAuthentication } from 'https://deno.land/x/smtp@v0.7.0/mod.ts'
import { addInvite } from '../../../../../db/migrations/20230703205040_invites.ts';
import db from '../../../../../db/db.ts'
import generateUUID from '../../../../../util/uuid.ts'

type InvitePageProps = {
  healthWorker: ReturnedSqlRow<HealthWorker>
}

type Invite = { email: string; profession: Profession }

function isInvite(
  value: unknown,
): value is Invite {
  return (
    typeof value === 'object' && value !== null &&
    'email' in value && typeof value.email === 'string' &&
    'profession' in value && typeof value.profession === 'string' &&
    ['doctor', 'nurse', 'admin'].includes(value.profession)
  )
}

function isInvites(
  values: unknown,
): values is Invite[] {
  return Array.isArray(values) && values.every(isInvite)
}

export const handler: LoggedInHealthWorkerHandler<InvitePageProps> = {
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
    //assert(isAdmin)
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

    //assert(isAdmin)

    const facilityId = parseInt(ctx.params.facilityId)
    assert(facilityId)

    console.log(`Inviting user to facility ${facilityId}`)

    const values = await parseRequest<Invite[]>(req, [], isInvites)
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
