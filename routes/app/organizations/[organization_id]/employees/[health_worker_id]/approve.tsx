import { approveInvitee } from '../../../../../../db/models/employment.ts'
import { assertOr403 } from '../../../../../../util/assertOr.ts'
import redirect from '../../../../../../util/redirect.ts'
import { getRequiredUUIDParam } from '../../../../../../util/getParam.ts'
import { OrganizationContext } from '../../_middleware.ts'
import { getEmployeeInfo } from '../../../../../../db/models/employee_info.ts'

export const handler = {
  async POST(ctx: OrganizationContext) {
    const { trx, organization, isAdminAtOrganization, health_worker } =
      ctx.state

    assertOr403(isAdminAtOrganization)

    const health_worker_id = getRequiredUUIDParam(ctx, 'health_worker_id')

    const getting_employee = getEmployeeInfo(
      trx,
      {
        health_worker_id,
        organization_id: organization.id,
      },
    )

    await approveInvitee(
      trx,
      {
        admin_id: health_worker.id,
        approving_id: health_worker_id,
      },
    )

    const success = `Successfully approved ${(await getting_employee)!.name}`

    return redirect(
      `/app/organizations/${organization.id}/employees?success=${success}`,
    )
  },
}
