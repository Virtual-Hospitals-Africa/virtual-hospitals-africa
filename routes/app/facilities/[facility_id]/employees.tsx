import { assert } from 'std/testing/asserts.ts'
import { PageProps } from '$fresh/server.ts'
import {
  Facility,
  HealthWorkerWithGoogleTokens,
  LoggedInHealthWorkerHandler,
  ReturnedSqlRow,
} from '../../../../types.ts'
import * as health_workers from '../../../../db/models/health_workers.ts'
import * as facilities from '../../../../db/models/facilities.ts'
import * as employment from '../../../../db/models/employment.ts'
import Layout from '../../../../components/library/Layout.tsx'
import EmployeesTable, {
  Employee,
} from '../../../../components/health_worker/EmployeesTable.tsx'
import { Container } from '../../../../components/library/Container.tsx'
import redirect from '../../../../util/redirect.ts'
import { CheckIcon } from '../../../../components/library/CheckIcon.tsx'
import CrossIcon from '../../../../components/library/icons/cross.tsx'
import { useState } from 'preact/hooks'

type EmployeePageProps = {
  isAdmin: boolean
  employees: Employee[]
  healthWorker: HealthWorkerWithGoogleTokens
  facility: ReturnedSqlRow<Facility>
}

export const handler: LoggedInHealthWorkerHandler<EmployeePageProps> = {
  async GET(_req, ctx) {
    const healthWorker = ctx.state.session.data
    assert(health_workers.isHealthWorkerWithGoogleTokens(healthWorker))

    const facility_id = parseInt(ctx.params.facility_id)
    assert(facility_id)

    const facility = await facilities.get(ctx.state.trx, facility_id)
    assert(facility, `facility ${facility_id} does not exist`)
    const isAdmin = await employment.isAdmin(
      ctx.state.trx,
      {
        health_worker_id: healthWorker.id,
        facility_id: facility_id,
      },
    )
    const employees = await employment.getByFacility(
      ctx.state.trx,
      { facility_id },
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

  const [isInvitedVisible, setIsInvitedVisible] = useState(!!invited)

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
          pathname={props.url.pathname}
        />
        {isInvitedVisible && (
          <div className='rounded-md bg-green-50 p-4 mt-4 mb-4'>
            <div className='flex justify-between'>
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
              <div className='ml-auto'>
                <CrossIcon
                  type='button'
                  className='text-green-400'
                  onClick={() => setIsInvitedVisible(false)}
                >
                </CrossIcon>
              </div>
            </div>
          </div>
        )}
      </Container>
    </Layout>
  )
}
