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
  Invitee,
} from '../../../../components/health_worker/EmployeesTable.tsx'
import { Container } from '../../../../components/library/Container.tsx'
import redirect from '../../../../util/redirect.ts'
import InviteSuccess from '../../../../islands/invite-success.tsx'
import partition from '../../../../util/partition.ts'
import { patch } from 'std/semver/mod.ts'

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

    const employeesAndInvitees = await employment
      .getEmployeeAndInviteeByFacility(
        ctx.state.trx,
        { facility_id },
      )

    const [employees_filtered, invitees_filtered] = partition(
      employeesAndInvitees,
      (item) => !item.is_invitee,
    )

    const isEmployeeAtFacility = employees_filtered.some((employee) =>
      employee.health_worker_id === healthWorker.id
    )
    if (!isEmployeeAtFacility) return redirect('/app')

    const employees = employees_filtered.map(
      (employee) => {
        return ({
          name: employee.name,
          professions: employee.professions,
          avatar_url: employee.avatar_url,
          // email: employee.email
        })
      },
    )

    const invitees = invitees_filtered
      .map((invitee) => {
        return {
          email: invitee.name,
          professions: invitee.professions,
        }
      })

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
        <InviteSuccess
          invited={invited}
        />
        <EmployeesTable
          isAdmin={props.data.isAdmin}
          employees={props.data.employees}
          pathname={props.url.pathname}
          invitees={props.data.invitees}
        />
      </Container>
    </Layout>
  )
}
