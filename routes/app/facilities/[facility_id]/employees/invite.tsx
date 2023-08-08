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
import {
  ConnectConfigWithAuthentication,
  SmtpClient,
} from 'https://deno.land/x/smtp@v0.7.0/mod.ts'
import * as employment from '../..../../../../../../db/models/employment.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import redirect from '../../../../../util/redirect.ts'

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
): values is { invites: Invite[] } {
  return isObjectLike(values) &&
    Array.isArray(values.invites) &&
    isInvite(values.invites[0]) &&
    // The last may be incomplete
    values.invites.slice(0, -1).every(isInvite)
}

// async function sendInviteMail(
//   email: string,
//   facility_id: number,
// ) {
//   const client = new SmtpClient()
//   const { SEND_EMAIL, PWD } = Deno.env.toObject()
//   const connectConfig: ConnectConfigWithAuthentication = {
//     hostname: 'smtp.gmail.com',
//     port: 465,
//     username: SEND_EMAIL,
//     password: PWD,
//   }
//   await client.connect(connectConfig)

//   await client.send({
//     from: SEND_EMAIL,
//     to: email,
//     subject: 'Welcome to VHA',
//     content: `Please visit ${origin}/login?invited=true`,
//   })

//   await client.close()
// }

export const handler: LoggedInHealthWorkerHandler<InvitePageProps> = {
  async GET(req, ctx) {
    const healthWorker = ctx.state.session.data
    const facility_id = parseInt(ctx.params.facility_id)
    assert(facility_id)
    assert(health_workers.isHealthWorkerWithGoogleTokens(healthWorker))
    const isAdmin = await employment.isAdmin(
      ctx.state.trx,
      {
        health_worker_id: healthWorker.id,
        facility_id: facility_id,
      },
    )
    assert(isAdmin)
    assert(facility_id)
    return ctx.render({ healthWorker })
  },
  async POST(req, ctx) {
    const healthWorker = ctx.state.session.data

    assert(health_workers.isHealthWorkerWithGoogleTokens(healthWorker))
    const isAdmin = await employment.isAdmin(
      ctx.state.trx,
      {
        health_worker_id: healthWorker.id,
        facility_id: parseInt(ctx.params.facility_id),
      },
    )

    assert(isAdmin)

    const facility_id = parseInt(ctx.params.facility_id)
    assert(facility_id)

    const { invites } = await parseRequest(ctx.state.trx, req, isInvites)

    const invitesWithEmails = invites.filter((invite) => invite.email)

    await employment.addInvitees(ctx.state.trx, facility_id, invitesWithEmails)

    return redirect(
      `/app/facilities/${facility_id}/employees?invited=${
        invitesWithEmails.map((invite) => invite.email).join(', ')
      }`,
    )
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
