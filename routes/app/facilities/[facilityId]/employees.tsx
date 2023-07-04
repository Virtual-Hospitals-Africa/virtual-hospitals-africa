import { assert } from 'std/testing/asserts.ts'
import { PageProps } from '$fresh/server.ts'
import {
  Facility,
  HealthWorkerWithGoogleTokens,
  LoggedInHealthWorkerHandler,
  ReturnedSqlRow,
} from '../../../../types.ts'
import * as health_workers from '../../../../db/models/health_workers.ts'
import Layout from '../../../../components/library/Layout.tsx'
import { Employee } from '../../../../components/health_worker/HealthWorkerTable.tsx'
import EmployeesTable from '../../../../components/health_worker/HealthWorkerTable.tsx'
import { Container } from '../../../../components/library/Container.tsx'
import redirect from '../../../../util/redirect.ts'

type EmployeePageProps = {
  isAdmin: boolean
  employees: Employee[]
  healthWorker: HealthWorkerWithGoogleTokens
  facility: ReturnedSqlRow<Facility>
}

export const handler: LoggedInHealthWorkerHandler<EmployeePageProps> = {
  async GET(_req, ctx) {
    const healthWorker = ctx.state.session.data
    const facilityId = parseInt(ctx.params.facilityId)
    assert(
      health_workers.isHealthWorkerWithGoogleTokens(healthWorker),
      'Invalid health worker',
    )
    const facility = await health_workers.getFacilityById(ctx.state.trx, {
      facilityId: facilityId,
    })
    assert(facility, `facility ${facilityId} does not exist`)
    const isAdmin = await health_workers.isAdmin(
      ctx.state.trx,
      {
        employee_id: healthWorker.id,
        facility_id: facilityId,
      },
    )
    const employees = await health_workers.getEmployeesAtFacility(
      ctx.state.trx,
      { facilityId },
    )
    if (
      !employees.some((employee) => {
        return employee.id === healthWorker.id
      })
    ) {
      //If the user isn't part of the facility they're trying to access
      return redirect('/app')
    }
    return ctx.render({ isAdmin, employees, healthWorker, facility })
  },
}

export default function EmployeeTable(
  props: PageProps<EmployeePageProps>,
) {
  console.log('props.data', props.data)
  return (
    <Layout
      title={`${props.data.facility.name} Employees`}
      route={props.route}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='standard'
    >
      <Container size='lg'>
        <EmployeesTable
          isAdmin={props.data.isAdmin}
          employees={props.data.employees}
          facilityId={props.data.facility.id}
        />
      </Container>
    </Layout>
  )
}
