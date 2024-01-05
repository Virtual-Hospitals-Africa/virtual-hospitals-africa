import { PageProps } from '$fresh/server.ts'
import {
  Facility,
  FacilityEmployeeOrInvitee,
  HealthWorkerWithGoogleTokens,
  LoggedInHealthWorkerHandler,
  ReturnedSqlRow,
} from '../../../../types.ts'
import * as facilities from '../../../../db/models/facilities.ts'
import Layout from '../../../../components/library/Layout.tsx'
import EmployeesTable from '../../../../components/health_worker/EmployeesTable.tsx'
import { Container } from '../../../../components/library/Container.tsx'
import { HomePageSidebar } from '../../../../components/library/Sidebar.tsx'

type EmployeePageProps = {
  isAdminAtFacility: boolean
  employees: FacilityEmployeeOrInvitee[]
  healthWorker: HealthWorkerWithGoogleTokens
  facility: ReturnedSqlRow<Facility>
}

export const handler: LoggedInHealthWorkerHandler<
  EmployeePageProps,
  { facility: ReturnedSqlRow<Facility>; isAdminAtFacility: boolean }
> = {
  async GET(_req, ctx) {
    const { healthWorker, facility, isAdminAtFacility } = ctx.state

    const getEmployees = isAdminAtFacility
      ? facilities.getEmployeesAndInvitees
      : facilities.getEmployees

    const employees = await getEmployees(
      ctx.state.trx,
      { facility_id: facility.id },
    )

    return ctx.render({
      isAdminAtFacility,
      employees,
      healthWorker,
      facility,
    })
  },
}

export default function EmployeeTable(
  props: PageProps<EmployeePageProps>,
) {
  return (
    <Layout
      title={`${props.data.facility.display_name} Employees`}
      sidebar={<HomePageSidebar route={props.route} />}
      url={props.url}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='home page'
    >
      <Container size='lg'>
        <EmployeesTable
          isAdmin={props.data.isAdminAtFacility}
          employees={props.data.employees}
          pathname={props.url.pathname}
          facility_id={props.data.facility.id}
          health_worker_id={props.data.healthWorker.id}
        />
      </Container>
    </Layout>
  )
}
