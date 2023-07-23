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
import EmployeesTable, {
  Employee,
} from '../../../../components/health_worker/EmployeesTable.tsx'
import { Container } from '../../../../components/library/Container.tsx'
import redirect from '../../../../util/redirect.ts'
import { CheckIcon } from '../../../../components/library/CheckIcon.tsx'

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
    const isEmployeeAtFacility = employees.some((employee) =>
      employee.id === healthWorker.id
    )
    if (!isEmployeeAtFacility) return redirect('/app')
    return ctx.render({ isAdmin, employees, healthWorker, facility })
  },
}

export default function EmployeeTable(
  props: PageProps<EmployeePageProps>,
) {
  const urlParams = new URLSearchParams(props.url.search)
  const invited = urlParams.get('invited')

  return (
    <Layout
      title={`${props.data.facility.name} Employees`}
      route={props.route}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='standard'
    >
      <Container size='lg'>
        {invited && (
          <div className='rounded-md bg-green-50 p-4 mb-4'>
            <div className='flex'>
              <div className='flex-shrink-0'>
                <CheckIcon
                  className='h-5 w-5 text-green-400'
                  aria-hidden='true'
                />
              </div>
              <div className='ml-3'>
                <h3 className='text-sm font-medium text-green-800'>
                  Successfully invited {invited}
                </h3>
              </div>
            </div>
          </div>
        )}
        <EmployeesTable
          isAdmin={props.data.isAdmin}
          employees={props.data.employees}
          pathname={props.url.pathname}
        />
      </Container>
    </Layout>
  )
}
