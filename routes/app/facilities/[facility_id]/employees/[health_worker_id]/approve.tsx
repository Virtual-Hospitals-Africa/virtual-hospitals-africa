import { approveInvitee } from '../../../../../../db/models/employment.ts'
import { LoggedInHealthWorkerHandler } from '../../../../../../types.ts'
import { assertOr403 } from '../../../../../../util/assertOr.ts'
import * as health_workers from '../../../../../../db/models/health_workers.ts'
import redirect from '../../../../../../util/redirect.ts'
import getNumericParam from '../../../../../../util/getNumericParam.ts'
import { FacilityContext } from '../../_middleware.ts'

export const handler: LoggedInHealthWorkerHandler<
  Record<string, never>,
  FacilityContext['state']
> = {
  async POST(_, ctx) {
    const { trx, facility, isAdminAtFacility, healthWorker } = ctx.state

    assertOr403(isAdminAtFacility)

    const health_worker_id = getNumericParam(ctx, 'health_worker_id')

    const getting_employee = health_workers.getEmployeeInfo(
      trx,
      health_worker_id,
      facility.id,
    )

    await approveInvitee(
      trx,
      {
        admin_id: healthWorker.id,
        approving_id: health_worker_id,
      },
    )

    const success = `Successfully approved ${(await getting_employee)!.name}`

    return redirect(
      `/app/facilities/${facility.id}/employees?success=${success}`,
    )
  },
}
