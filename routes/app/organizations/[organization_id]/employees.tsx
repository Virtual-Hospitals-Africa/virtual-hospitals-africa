import { employees } from '../../../../db/models/employees.ts'
import EmployeesTable from '../../../../components/health_worker/EmployeesTable.tsx'
import { HealthWorkerHomePage } from '../../_middleware.tsx'
import { OrganizationContext } from '../../../../types.ts'
import OrganizationTabs from '../../../../components/organizations/OrganizationTabs.tsx'

export default HealthWorkerHomePage<OrganizationContext>(
  async function EmployeeTable(
    ctx,
  ) {
    const { trx, health_worker, organization, is_admin_at_organization } = ctx.state

    const employees_of_organization = await employees.findAll(trx, {
      organization_id: organization.id,
    })

    return {
      title: `${organization.name} Employees`,
      children: (
        <>
          <OrganizationTabs organization_id={organization.id} active_tab='employees' />
          <EmployeesTable
            is_admin={is_admin_at_organization}
            employees={employees_of_organization}
            pathname={ctx.url.pathname}
            organization_id={organization.id}
            health_worker_id={health_worker.id}
          />
        </>
      ),
    }
  },
)
