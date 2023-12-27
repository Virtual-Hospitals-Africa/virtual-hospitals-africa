import { PageProps } from '$fresh/server.ts'
import Layout from '../../../../../components/library/Layout.tsx'
import {
  Facility,
  HealthWorker,
  LoggedInHealthWorkerHandler,
  Profession,
  ReturnedSqlRow,
} from '../../../../../types.ts'
import { parseRequest } from '../../../../../util/parseForm.ts'
import InviteEmployeesForm from '../../../../../islands/invites-form.tsx'
// import {
//   ConnectConfigWithAuthentication,
//   SmtpClient,
// } from 'https://deno.land/x/smtp@v0.7.0/mod.ts'
import * as facilities from '../../../../../db/models/facilities.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import redirect from '../../../../../util/redirect.ts'
import { assertOr403 } from '../../../../../util/assertOr.ts'

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

export const handler: LoggedInHealthWorkerHandler<InvitePageProps, {
  facility: ReturnedSqlRow<Facility>
  isAdminAtFacility: boolean
}> = {
  GET(_req, ctx) {
    assertOr403(ctx.state.isAdminAtFacility)
    return ctx.render({ healthWorker: ctx.state.healthWorker })
  },
  async POST(req, ctx) {
    assertOr403(ctx.state.isAdminAtFacility)

    const { invites } = await parseRequest(ctx.state.trx, req, isInvites)

    const invitesWithEmails = invites.filter((invite) => invite.email)

    const result = await facilities.invite(
      ctx.state.trx,
      ctx.state.facility.id,
      invitesWithEmails,
    )

    if (!result.success) {
      const url = new URL(req.url)
      url.searchParams.set(
        'error',
        result.error!,
      )
      return redirect(url.toString())
    }

    const invited = invitesWithEmails.map((invite) => invite.email).join(', ')
    const successMessage = encodeURIComponent(`Successfully invited ${invited}`)

    return redirect(
      `/app/facilities/${ctx.state.facility.id}/employees?success=${successMessage}`,
    )
  },
}

export default function InviteEmployees(props: PageProps) {
  const alreadyEmployees = props.url.searchParams.get('alreadyEmployees')

  return (
    <Layout
      title='Invite Employees'
      route={props.route}
      url={props.url}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='standard'
    >
      <InviteEmployeesForm
        alreadyEmployees={alreadyEmployees ? alreadyEmployees.split(',') : null}
      />
    </Layout>
  )
}
