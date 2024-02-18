import {
  Facility,
  HasId,
  LoggedInHealthWorkerContext,
} from '../../../../types.ts'
import * as facilities from '../../../../db/models/facilities.ts'
import { assertOr403, assertOr404 } from '../../../../util/assertOr.ts'
import { getRequiredNumericParam } from '../../../../util/getNumericParam.ts'

export type FacilityContext = LoggedInHealthWorkerContext<{
  facility: HasId<Facility>
  isAdminAtFacility: boolean
}>

export async function handler(
  _req: Request,
  ctx: FacilityContext,
) {
  const { healthWorker } = ctx.state
  const facility_id = getRequiredNumericParam(ctx, 'facility_id')

  assertOr403(
    healthWorker.employment.some((e) => e.facility.id === facility_id),
    'Must be employed at this facility to access it',
  )

  const [facility] = await facilities.get(ctx.state.trx, { ids: [facility_id] })
  assertOr404(facility)

  const isAdminAtFacility = healthWorker.employment.some((e) =>
    e.facility.id === facility.id && e.roles.admin
  )

  ctx.state.facility = facility
  ctx.state.isAdminAtFacility = isAdminAtFacility
  return ctx.next()
}
