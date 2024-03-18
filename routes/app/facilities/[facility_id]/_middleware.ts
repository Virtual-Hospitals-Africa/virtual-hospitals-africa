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
  facility: HasId<Facility>
  facility_employment: HealthWorkerEmployment
  isAdminAtFacility: boolean
}>

export async function handler(
  _req: Request,
  ctx: FacilityContext,
) {
  const { healthWorker } = ctx.state
  const facility_id = getRequiredNumericParam(ctx, 'facility_id')

  const facility_employment = healthWorker.employment.find((e) =>
    e.facility.id === facility_id
  )

  assertOr403(
    facility_employment,
    'Must be employed at this facility to access it',
  )

  const [facility] = await facilities.get(ctx.state.trx, { ids: [facility_id] })
  assertOr404(facility)

  ctx.state.facility = facility
  ctx.state.facility_employment = facility_employment
  ctx.state.isAdminAtFacility = !!facility_employment.roles.admin
  return ctx.next()
}
