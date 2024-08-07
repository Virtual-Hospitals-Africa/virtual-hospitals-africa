import { PageProps } from '$fresh/server.ts'
import {
  EmployedHealthWorker,
  HasStringId,
  LoggedInHealthWorkerHandlerWithProps,
  Organization,
  OrganizationEmployeeOrInvitee,
} from '../../../../types.ts'
import * as organizations from '../../../../db/models/organizations.ts'
import Layout from '../../../../components/library/Layout.tsx'
import EmployeesTable from '../../../../components/health_worker/EmployeesTable.tsx'

type EmployeePageProps = {
  isAdminAtOrganization: boolean
  employees: OrganizationEmployeeOrInvitee[]
  healthWorker: EmployedHealthWorker
  organization: HasStringId<Organization>
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
  EmployeePageProps,
  { organization: HasStringId<Organization>; isAdminAtOrganization: boolean }
> = {
  async GET(_req, ctx) {
    const { healthWorker, organization, isAdminAtOrganization } = ctx.state

    const getEmployees = isAdminAtOrganization
      ? organizations.getEmployeesAndInvitees
      : organizations.getEmployees

    const employees = await getEmployees(
      ctx.state.trx,
      organization.id,
    )

    return ctx.render({
      isAdminAtOrganization,
      employees,
      healthWorker,
      organization,
    })
  },
}

export default function EmployeeTable(
  props: PageProps<EmployeePageProps>,
) {
  return (
    <Layout
      title={`${props.data.organization.name} Employees`}
      route={props.route}
      url={props.url}
      health_worker={props.data.healthWorker}
      variant='practitioner home page'
    >
      <EmployeesTable
        isAdmin={props.data.isAdminAtOrganization}
        employees={props.data.employees}
        pathname={props.url.pathname}
        organization_id={props.data.organization.id}
        health_worker_id={props.data.healthWorker.id}
      />
    </Layout>
  )
}
