import { employees } from '../../../../db/models/employees.ts'
import EmployeesTable from '../../../../components/health_worker/EmployeesTable.tsx'
import { HealthWorkerHomePageLayout } from '../../_middleware.tsx'
import { OrganizationContext } from './_middleware.ts'

export default HealthWorkerHomePageLayout<OrganizationContext>(
  async function EmployeeTable(
    ctx,
  ) {
    const { trx, health_worker, organization, is_admin_at_organization } = ctx.state

    // const getEmployees = is_admin_at_organization
    //   ? organizations.getEmployeesAndInvitees
    //   : organizations.getEmployees

    const employees_of_organization = await employees.findAll(trx, {
      organization_id: organization.id,
    })

    // const employees = await getEmployees(
    //   ctx.state.trx,
    //   organization.id,
    // )

    return {
      title: `${organization.name} Employees`,
      children: (
        <EmployeesTable
          is_admin={is_admin_at_organization}
          employees={employees_of_organization}
          pathname={ctx.url.pathname}
          organization_id={organization.id}
          health_worker_id={health_worker.id}
        />
      ),
    }
  },
)
