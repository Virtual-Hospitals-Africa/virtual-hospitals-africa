import { FreshContext } from '$fresh/server.ts'
import { WithSession } from 'fresh_session'
import {
  EmployedHealthWorker,
  Facility,
  ReturnedSqlRow,
  TrxOrDb,
} from '../../../../types.ts'
import * as facilities from '../../../../db/models/facilities.ts'
import { assertOr403, assertOr404 } from '../../../../util/assertOr.ts'
import getNumericParam from '../../../../util/getNumericParam.ts'

export async function handler(
  _req: Request,
  ctx: FreshContext<
    WithSession & {
      trx: TrxOrDb
      facility: ReturnedSqlRow<Facility>
      isAdminAtFacility: boolean
      healthWorker: EmployedHealthWorker
    }
  >,
) {
  const { healthWorker } = ctx.state
  const facility_id = getNumericParam(ctx, 'facility_id')

  assertOr403(
    healthWorker.employment.some((e) => e.facility_id === facility_id),
  )

  const [facility] = await facilities.get(ctx.state.trx, { ids: [facility_id] })
  assertOr404(facility)

  const isAdminAtFacility = healthWorker.employment.some((e) =>
    e.facility_id === facility.id && e.roles.admin
  )

  ctx.state.facility = facility
  ctx.state.isAdminAtFacility = isAdminAtFacility
  return ctx.next()
}
