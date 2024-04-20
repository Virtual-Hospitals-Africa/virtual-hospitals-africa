import {
  Facility,
  HasId,
  LoggedInHealthWorkerContext,
} from '../../../../types.ts'
import * as facilities from '../../../../db/models/facilities.ts'
import { assertOr403, assertOr404 } from '../../../../util/assertOr.ts'
import { getRequiredNumericParam } from '../../../../util/getNumericParam.ts'
import { HealthWorkerEmployment } from '../../../../types.ts'

export type FacilityContext = LoggedInHealthWorkerContext<{
  organization: HasId<Facility>
  organization_employment: HealthWorkerEmployment
  isAdminAtFacility: boolean
}>

export async function handler(
  _req: Request,
  ctx: FacilityContext,
) {
  const { healthWorker } = ctx.state
  const organization_id = getRequiredNumericParam(ctx, 'organization_id')

  const organization_employment = healthWorker.employment.find((e) =>
    e.organization.id === organization_id
  )

  assertOr403(
    organization_employment,
    'Must be employed at this organization to access it',
  )

  const [organization] = await facilities.get(ctx.state.trx, { ids: [organization_id] })
  assertOr404(organization)

  ctx.state.organization = organization
  ctx.state.organization_employment = organization_employment
  ctx.state.isAdminAtFacility = !!organization_employment.roles.admin
  return ctx.next()
}
