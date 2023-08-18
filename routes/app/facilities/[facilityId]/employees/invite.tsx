import { HandlerContext, PageProps } from '$fresh/server.ts'
import Layout from '../../../../../components/library/Layout.tsx'
import {
  HealthWorker,
  LoggedInHealthWorker,
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
import * as employment from '../../../../../db/models/employment.ts'
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

async function assertIsAdminAtFacility(
  ctx: HandlerContext<InvitePageProps, LoggedInHealthWorker>,
) {
  const healthWorker = ctx.state.session.data
  const facilityId = parseInt(ctx.params.facilityId)
  assert(facilityId)
  assert(health_workers.isHealthWorkerWithGoogleTokens(healthWorker))
  const isAdmin = await employment.isAdmin(
    ctx.state.trx,
    {
      health_worker_id: healthWorker.id,
      facility_id: facilityId,
    },
  )
  assert(isAdmin)
  return { healthWorker, facilityId }
}

export const handler: LoggedInHealthWorkerHandler<InvitePageProps> = {
  async GET(req, ctx) {
    const { healthWorker } = await assertIsAdminAtFacility(ctx)
    return ctx.render({ healthWorker })
  },
  async POST(req, ctx) {
    const { facilityId } = await assertIsAdminAtFacility(ctx)

    const { invites } = await parseRequest(ctx.state.trx, req, isInvites)

    const invitesWithEmails = invites.filter((invite) => invite.email)

    const existingEmployees = await employment.getMatching(ctx.state.trx, {
      facility_id: facilityId,
      invitees: invitesWithEmails,
    })

    if (existingEmployees.length) {
      const url = new URL(req.url)
      url.searchParams.set(
        'alreadyEmployees',
        existingEmployees.map((employee) => employee.email).join(','),
      )
      return redirect(url.toString())
    }

    await employment.addInvitees(ctx.state.trx, facilityId, invitesWithEmails)

    return redirect(
      `/app/facilities/${facilityId}/employees?invited=${
        invitesWithEmails.map((invite) => invite.email).join(', ')
      }`,
    )
  },
}

export default function InviteEmployees(props: PageProps) {
  const alreadyEmployees = props.url.searchParams.get('alreadyEmployees')

  return (
    <Layout
      title='Invite Employees'
      route={props.route}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='standard'
    >
      <InviteEmployeesForm
        alreadyEmployees={alreadyEmployees ? alreadyEmployees.split(',') : null}
      />
    </Layout>
  )
}
