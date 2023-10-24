import { PageProps } from '$fresh/server.ts'
import {
  Facility,
  HealthWorkerWithGoogleTokens,
  LoggedInHealthWorkerHandler,
  ReturnedSqlRow,
} from '../../../../types.ts'
import * as facilities from '../../../../db/models/facilities.ts'
import Layout from '../../../../components/library/Layout.tsx'
import EmployeesTable from '../../../../components/health_worker/EmployeesTable.tsx'
import { Container } from '../../../../components/library/Container.tsx'

type EmployeePageProps = {
  isAdminAtFacility: boolean
  employees: facilities.FacilityEmployee[]
  healthWorker: HealthWorkerWithGoogleTokens
  facility: ReturnedSqlRow<Facility>
}

export const handler: LoggedInHealthWorkerHandler<
  EmployeePageProps,
  { facility: ReturnedSqlRow<Facility>; isAdminAtFacility: boolean }
> = {
  async GET(_req, ctx) {
    const { healthWorker, facility, isAdminAtFacility } = ctx.state

    const employees = await facilities
      .getEmployees(
        ctx.state.trx,
        { facility_id: facility.id, include_invitees: isAdminAtFacility },
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
      title={`${props.data.facility.name} Employees`}
      route={props.route}
      url={props.url}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='standard'
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
