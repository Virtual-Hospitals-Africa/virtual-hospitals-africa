import { PageProps } from '$fresh/server.ts'
import Layout from '../../../../../components/library/Layout.tsx'
import {
  HasStringId,
  LoggedInHealthWorkerHandlerWithProps,
  Organization,
  Profession,
} from '../../../../../types.ts'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import InviteEmployeesForm from '../../../../../islands/invites-form.tsx'
import * as organizations from '../../../../../db/models/organizations.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import redirect from '../../../../../util/redirect.ts'
import { assertOr400, assertOr403 } from '../../../../../util/assertOr.ts'
import { EmployedHealthWorker } from '../../../../../types.ts'

type InvitePageProps = {
  healthWorker: EmployedHealthWorker
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

export const handler: LoggedInHealthWorkerHandlerWithProps<InvitePageProps, {
  organization: HasStringId<Organization>
  isAdminAtOrganization: boolean
}> = {
  GET(_req, ctx) {
    assertOr403(ctx.state.isAdminAtOrganization)
    return ctx.render({ healthWorker: ctx.state.healthWorker })
  },
  async POST(req, ctx) {
    assertOr403(ctx.state.isAdminAtOrganization)

    const { invites } = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsInvites,
    )

    const invitesWithEmails = invites.filter((invite) => invite.email)

    await organizations.invite(
      ctx.state.trx,
      ctx.state.organization.id,
      invitesWithEmails,
    )

    const invited = invitesWithEmails.map((invite) => invite.email).join(', ')
    const successMessage = encodeURIComponent(`Successfully invited ${invited}`)

    return redirect(
      `/app/organizations/${ctx.state.organization.id}/employees?success=${successMessage}`,
    )
  },
}

export default function InviteEmployees(props: PageProps) {
  return (
    <Layout
      title='Invite Employees'
      route={props.route}
      url={props.url}
      health_worker={props.data.healthWorker}
      variant='health worker home page'
    >
      <InviteEmployeesForm />
    </Layout>
  )
}
