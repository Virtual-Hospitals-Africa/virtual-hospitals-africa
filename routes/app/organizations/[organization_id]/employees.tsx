import * as organizations from '../../../../db/models/organizations.ts'
import EmployeesTable from '../../../../components/health_worker/EmployeesTable.tsx'
import { HealthWorkerHomePageLayout } from '../../_middleware.tsx'
import { OrganizationContext } from './_middleware.ts'

export default HealthWorkerHomePageLayout<OrganizationContext>(
  async function EmployeeTable(
    _req,
    ctx,
  ) {
    const { healthWorker, organization, isAdminAtOrganization } = ctx.state

    const getEmployees = isAdminAtOrganization
      ? organizations.getEmployeesAndInvitees
      : organizations.getEmployees

    const employees = await getEmployees(
      ctx.state.trx,
      organization.id,
    )

    return {
      title: `${organization.name} Employees`,
      children: (
        <EmployeesTable
          isAdmin={isAdminAtOrganization}
          employees={employees}
          pathname={ctx.url.pathname}
          organization_id={organization.id}
          health_worker_id={healthWorker.id}
        />
      ),
    }
  },
)
