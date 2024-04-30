import {
  Organization,
  HasId,
  LoggedInHealthWorkerContext,
} from '../../../../types.ts'
import * as organizations from '../../../../db/models/organizations.ts'
import { assertOr403, assertOr404 } from '../../../../util/assertOr.ts'
import { getRequiredNumericParam } from '../../../../util/getNumericParam.ts'
import { HealthWorkerEmployment } from '../../../../types.ts'

export type OrganizationContext = LoggedInHealthWorkerContext<{
  organization: HasId<Organization>
  organization_employment: HealthWorkerEmployment
  isAdminAtOrganization: boolean
}>

export async function handler(
  _req: Request,
  ctx: OrganizationContext,
) {
  const { healthWorker } = ctx.state
  const { organization_id } = ctx.params

  const organization_employment = healthWorker.employment.find((e) =>
    e.organization.id === organization_id
  )

  assertOr403(
    organization_employment,
    'Must be employed at this organization to access it',
  )

  const [organization] = await organizations.get(ctx.state.trx, {
    ids: [organization_id],
  })
  assertOr404(organization)

  ctx.state.organization = organization
  ctx.state.organization_employment = organization_employment
  ctx.state.isAdminAtOrganization = !!organization_employment.roles.admin
  return ctx.next()
}
