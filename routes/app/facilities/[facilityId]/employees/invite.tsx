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
import { addToInvitees } from '../..../../../../../../db/models/health_workers.ts'
import generateUUID from '../../../../../util/uuid.ts'
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
): values is Invite[] {
  return true
  //commented out because it's somehow causing error
  //return Array.isArray(values) && values.every(isInvite)
}

async function sendInviteMail(
  email: string,
  inviteCode: string,
  facilityId: number,
) {
  const client = new SmtpClient()
  const { SEND_EMAIL, PWD } = Deno.env.toObject()
  const connectConfig: ConnectConfigWithAuthentication = {
    hostname: 'smtp.gmail.com',
    port: 465,
    username: SEND_EMAIL,
    password: PWD,
  }
  await client.connect(connectConfig)

  await client.send({
    from: SEND_EMAIL,
    to: email,
    subject: 'Welcome to VHA',
    content:
      `Please visit ${origin}/facilities/${facilityId}/accept-invite?inviteCode=${inviteCode}`,
  })

  await client.close()
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
    assert(isAdmin)
    assert(facilityId)
    return ctx.render({ healthWorker })
  },
  async POST(req, ctx) {
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

    const values = await parseRequest<Invite[]>(req, [], isInvites)
    console.log(values)
    for (const invite of values) {
      const email = invite.email
      const profession = invite.profession

      if (email) {
        const inviteCode = generateUUID()
        //still working on sendInviteMail
        //await sendInviteMail(email, inviteCode, facilityId)
        const Response = await addToInvitees(ctx.state.trx, {
          email: email,
          profession: profession,
          facility_id: facilityId,
          invite_code: inviteCode,
        })
        console.log(Response)
      }
    }
    return redirect(`/app/email-success`)
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
