import { PageProps } from '$fresh/server.ts'
import {
  EmployedHealthWorker,
  Facility,
  FacilityEmployeeOrInvitee,
  HasId,
  LoggedInHealthWorkerHandlerWithProps,
} from '../../../../types.ts'
import * as facilities from '../../../../db/models/facilities.ts'
import Layout from '../../../../components/library/Layout.tsx'
import EmployeesTable from '../../../../components/health_worker/EmployeesTable.tsx'

type EmployeePageProps = {
  isAdminAtFacility: boolean
  employees: FacilityEmployeeOrInvitee[]
  healthWorker: EmployedHealthWorker
  organization: HasId<Facility>
}

export const handler: LoggedInHealthWorkerHandlerWithProps<
  EmployeePageProps,
  { organization: HasId<Facility>; isAdminAtFacility: boolean }
> = {
  async GET(_req, ctx) {
    const { healthWorker, organization, isAdminAtFacility } = ctx.state

    const getEmployees = isAdminAtFacility
      ? facilities.getEmployeesAndInvitees
      : facilities.getEmployees

    const employees = await getEmployees(
      ctx.state.trx,
      { organization_id: organization.id },
    )

    return ctx.render({
      isAdminAtFacility,
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
      variant='home page'
    >
      <EmployeesTable
        isAdmin={props.data.isAdminAtFacility}
        employees={props.data.employees}
        pathname={props.url.pathname}
        organization_id={props.data.organization.id}
        health_worker_id={props.data.healthWorker.id}
      />
    </Layout>
  )
}
