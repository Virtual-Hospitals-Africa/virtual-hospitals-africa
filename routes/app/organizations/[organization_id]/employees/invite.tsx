import { Profession } from '../../../../../types.ts'
import { parseRequestAsserts } from '../../../../../util/parseForm.ts'
import InviteEmployeesForm from '../../../../../islands/invites-form.tsx'
import * as organizations from '../../../../../db/models/organizations.ts'
import isObjectLike from '../../../../../util/isObjectLike.ts'
import redirect from '../../../../../util/redirect.ts'
import { assertOr400, assertOr403 } from '../../../../../util/assertOr.ts'
import { HealthWorkerHomePageLayout } from '../../../_middleware.tsx'
import { OrganizationContext } from '../_middleware.ts'

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

export const handler = {
  async POST(ctx: OrganizationContext) {
    const req = ctx.req

    assertOr403(ctx.state.is_admin_at_organization)

    const { invites } = await parseRequestAsserts(
      ctx.state.trx,
      req,
      assertIsInvites,
    )

    const invites_with_emails = invites.filter((invite) => invite.email)

    await organizations.invite(
      ctx.state.trx,
      ctx.state.organization.id,
      invites_with_emails,
    )

    const invited = invites_with_emails.map((invite) => invite.email).join(', ')
    const success_message = encodeURIComponent(
      `Successfully invited ${invited}`,
    )

    return redirect(
      `/app/organizations/${ctx.state.organization.id}/employees?success=${success_message}`,
    )
  },
}

export default HealthWorkerHomePageLayout<OrganizationContext>(
  'Invite Employees',
  function InviteEmployeesPage(ctx) {
    assertOr403(ctx.state.is_admin_at_organization)
    return <InviteEmployeesForm />
  },
)
