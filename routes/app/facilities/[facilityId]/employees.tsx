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
import InviteesTable, {
  Invitee,
} from '../../../../components/health_worker/InviteesTable.tsx'
import InviteSuccess from '../../../../islands/invite-success.tsx'

type EmployeePageProps = {
  isAdmin: boolean
  employees: Employee[]
  invitees: Invitee[]
  healthWorker: HealthWorkerWithGoogleTokens
  facility: ReturnedSqlRow<Facility>
}

export const handler: LoggedInHealthWorkerHandler<EmployeePageProps> = {
  async GET(_req, ctx) {
    const healthWorker = ctx.state.session.data
    assert(health_workers.isHealthWorkerWithGoogleTokens(healthWorker))

    const facility_id = parseInt(ctx.params.facilityId)
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
    const invitees = await health_workers.getInviteesAtFacility(
      ctx.state.trx,
      facility_id,
    )
    return ctx.render({ isAdmin, employees, invitees, healthWorker, facility })
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
        <EmployeesTable
          isAdmin={props.data.isAdmin}
          employees={props.data.employees}
          pathname={props.url.pathname}
        />
        <InviteSuccess
          invited={invited}
        />
        {props.data.isAdmin && (
          <>
            <div className='mt-4 mb-1 px-1 py-1 sm:px-1'>
              <h3 className='text-base font-semibold leading-7 text-gray-900'>
                Invitees
              </h3>
              <p className='mt-1 max-w-2xl text-sm leading-6 text-gray-500'>
                Recently invited health workers.
              </p>
            </div>
            <InviteesTable
              invitees={props.data.invitees}
            />
          </>
        )}
      </Container>
    </Layout>
  )
}
