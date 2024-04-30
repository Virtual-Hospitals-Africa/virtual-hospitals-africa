import { approveInvitee } from '../../../../../../db/models/employment.ts'
import { LoggedInHealthWorkerHandlerWithProps } from '../../../../../../types.ts'
import { assertOr403 } from '../../../../../../util/assertOr.ts'
import * as health_workers from '../../../../../../db/models/health_workers.ts'
import redirect from '../../../../../../util/redirect.ts'
import { getRequiredNumericParam } from '../../../../../../util/getNumericParam.ts'
import { FacilityContext } from '../../_middleware.ts'

export const handler: LoggedInHealthWorkerHandlerWithProps<
  Record<string, never>,
  FacilityContext['state']
> = {
  async POST(_, ctx) {
    const { trx, organization, isAdminAtFacility, healthWorker } = ctx.state

    assertOr403(isAdminAtFacility)

    const health_worker_id = getRequiredNumericParam(ctx, 'health_worker_id')

    const getting_employee = health_workers.getEmployeeInfo(
      trx,
      {
        health_worker_id,
        organization_id: organization.id,
      },
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
      `/app/organizations/${organization.id}/employees?success=${success}`,
    )
  },
}
