import { PageProps } from '$fresh/server.ts'
import Layout from '../../../../../components/library/Layout.tsx'
import {
  Facility,
  HealthWorker,
  LoggedInHealthWorkerHandler,
  Profession,
  ReturnedSqlRow,
} from '../../../../../types.ts'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import InviteEmployeesForm from '../../../../../islands/invites-form.tsx'
import * as facilities from '../../../../../db/models/facilities.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import redirect from '../../../../../util/redirect.ts'
import { assertOr400, assertOr403 } from '../../../../../util/assertOr.ts'

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

function assertIsInvites(
  values: unknown,
): asserts values is { invites: Invite[] } {
  assertOr400(isObjectLike(values))
  assertOr400(Array.isArray(values.invites))
  assertOr400(isInvite(values.invites[0]))
  assertOr400(values.invites.slice(0, -1).every(isInvite))
}

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

    const { invites } = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsInvites,
    )

    const invitesWithEmails = invites.filter((invite) => invite.email)

    await facilities.invite(
      ctx.state.trx,
      ctx.state.facility.id,
      invitesWithEmails,
    )

    const invited = invitesWithEmails.map((invite) => invite.email).join(', ')
    const successMessage = encodeURIComponent(`Successfully invited ${invited}`)

    return redirect(
      `/app/facilities/${ctx.state.facility.id}/employees?success=${successMessage}`,
    )
  },
}

export default function InviteEmployees(props: PageProps) {
  return (
    <Layout
      title='Invite Employees'
      route={props.route}
      url={props.url}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='home page'
    >
      <InviteEmployeesForm />
    </Layout>
  )
}
