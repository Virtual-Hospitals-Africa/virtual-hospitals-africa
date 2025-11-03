import {
  HealthWorkerEmployment,
  LoggedInHealthWorkerContext,
  RenderedOrganization,
} from '../../../../types.ts'
import * as organizations from '../../../../db/models/organizations.ts'
import { assertOr403 } from '../../../../util/assertOr.ts'

export type OrganizationState = {
  organization: RenderedOrganization
  organization_employment: HealthWorkerEmployment
  isAdminAtOrganization: boolean
}

export type OrganizationContext = LoggedInHealthWorkerContext<OrganizationState>

export async function handler(
  ctx: OrganizationContext,
) {
  const { health_worker } = ctx.state
  const { organization_id } = ctx.params

  const organization_employment = health_worker.employment.find((e) =>
    e.organization.id === organization_id
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
  ctx.state.isAdminAtOrganization = !!organization_employment.roles.admin
  return ctx.next()
}
