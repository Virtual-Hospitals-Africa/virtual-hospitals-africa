import { assert } from 'std/testing/asserts.ts'
import { PageProps } from '$fresh/server.ts'
import {
  Facility,
  HealthWorkerWithGoogleTokens,
  LoggedInHealthWorkerHandler,
} from '../../../../types.ts'
import * as health_workers from '../../../../db/models/health_workers.ts'
import Layout from '../../../../components/library/Layout.tsx'
import { Employee } from '../../../../components/health_worker/HealthWorkerTable.tsx'
import HealthWorkerTable from '../../../../components/health_worker/HealthWorkerTable.tsx'
import { Container } from '../../../../components/library/Container.tsx'
import redirect from '../../../../util/redirect.ts'

export const handler: LoggedInHealthWorkerHandler<
  {
    isAdmin: boolean
    tableData: Employee[]
    healthWorker: HealthWorkerWithGoogleTokens
    facility: Facility
  }
> = {
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
    assert(facility, 'facility no.' + facilityId + ' does not exist')
    const isAdmin = await health_workers.isAdmin(
      ctx.state.trx,
      {
        employee_id: healthWorker.id,
        facility_id: facilityId,
      },
    )
    const employeeData = await health_workers.getEmployeesAtFacility(
      ctx.state.trx,
      {
        facilityId: facilityId,
      },
    )
    if (
      !employeeData.some((employee) => {
        return employee.id === healthWorker.id
      })
    ) {
      //If the user isn't part of the facility they're trying to access
      return redirect('/app')
    }
    const tableData: Employee[] = []
    employeeData.map((value) => {
      tableData.push(
        {
          name: value.name,
          profession: value.profession,
          id: value.id,
          avatar_url: value.avatar_url,
        },
      )
    })
    return ctx.render({ isAdmin, tableData, healthWorker, facility })
  },
}

export default function EmployeeTable(
  props: PageProps<
    {
      isAdmin: boolean
      tableData: Employee[]
      healthWorker: HealthWorkerWithGoogleTokens
      facility: Facility
    }
  >,
) {
  console.log('props.data', props.data)
  return (
    <Layout
      title={'View health workers at ' + props.data.facility.name + '.'}
      route={props.route}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='standard'
    >
      <Container size='lg'>
        <HealthWorkerTable
          isAdmin={props.data.isAdmin}
          employees={props.data.tableData}
        />
      </Container>
    </Layout>
  )
}
