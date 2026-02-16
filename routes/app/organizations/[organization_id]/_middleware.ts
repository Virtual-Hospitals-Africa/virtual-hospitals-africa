import { HealthWorkerOrganization, LoggedInHealthWorkerContext, RenderedEmployee, RenderedOrganization } from '../../../../types.ts'
import { organizations } from '../../../../db/models/organizations.ts'
import { assertOr403 } from '../../../../util/assertOr.ts'

export type OrganizationState = {
  organization: RenderedOrganization
  organization_id: string
  organization_employment: HealthWorkerOrganization
  employee: RenderedEmployee
  employment_id: string
  is_admin_at_organization: boolean
}

export type OrganizationContext<T = Record<never, never>> = LoggedInHealthWorkerContext<OrganizationState & T>

export async function handler(
  ctx: OrganizationContext,
) {
  const { health_worker } = ctx.state
  const { organization_id } = ctx.params

  const organization_employment = health_worker.organizations.find((o) => o.id === organization_id)

  assertOr403(
    organization_employment,
    'Must be employed at this organization to access it',
  )

  const organization = await organizations.getById(
    ctx.state.trx,
    organization_id,
  )

  const employee: RenderedEmployee = {
    ...health_worker,
    organization_id: organization.id,
    employee_id: organization_employment.employment_id,
    profession: organization_employment.role,
    is_admin: organization_employment.is_admin,
    specialty: organization_employment.specialty,
    href: `/app/organizations/${organization.id}/employees/${health_worker.id}`,
  }

  const organization_state: OrganizationState = {
    organization,
    organization_employment,
    employee,
    is_admin_at_organization: organization_employment.is_admin,
    organization_id: organization.id,
    employment_id: employee.employee_id,
  }

  Object.assign(ctx.state, organization_state)

  return ctx.next()
}
