import {
  HealthWorkerOrganization,
  LoggedInHealthWorkerContext,
  RenderedOrganization,
} from '../../../../types.ts'
import * as organizations from '../../../../db/models/organizations.ts'
import { assertOr403 } from '../../../../util/assertOr.ts'

export type OrganizationState = {
  organization: RenderedOrganization
  organization_employment: HealthWorkerOrganization
  is_admin_at_organization: boolean
}

export type OrganizationContext<T = Record<never, never>> =
  LoggedInHealthWorkerContext<OrganizationState & T>

export async function handler(
  ctx: OrganizationContext,
) {
  const { health_worker } = ctx.state
  const { organization_id } = ctx.params

  const organization_employment = health_worker.organizations.find((o) =>
    o.id === organization_id
  )

  assertOr403(
    organization_employment,
    'Must be employed at this organization to access it',
  )

  const organization = await organizations.getById(
    ctx.state.trx,
    organization_id,
  )

  ctx.state.organization = organization
  ctx.state.organization_employment = organization_employment
  ctx.state.is_admin_at_organization = organization_employment.roles.some(
    (role) => role.profession === 'admin',
  )
  return ctx.next()
}
