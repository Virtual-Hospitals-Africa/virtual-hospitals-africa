import { assert } from 'std/assert/assert.ts'
import { PageProps } from '$fresh/server.ts'
import redirect from '../../../../../util/redirect.ts'
import Layout from '../../../../../components/library/Layout.tsx'
import { Container } from '../../../../../components/library/Container.tsx'
import SectionHeader from '../../../../../components/library/typography/SectionHeader.tsx'
import HealthWorkerDetailedCard from '../../../../../components/health_worker/DetailedCard.tsx'

import * as health_workers from '../../../../../db/models/health_workers.ts'
import * as nurse_specialties from '../../../../../db/models/nurse_specialties.ts'

import {
  EmployeeInfo,
  Facility,
  LoggedInHealthWorkerHandler,
  ReturnedSqlRow,
} from '../../../../../types.ts'
import { assertOr404 } from '../../../../../util/assertOr.ts'
import { Button } from '../../../../../components/library/Button.tsx'
import ApproveSuccess from '../../../../../islands/ApproveSuccess.tsx'
import { approveInvitee, isAdmin } from '../../../../../db/models/employment.ts'

type HealthWorkerPageProps = {
  employee: EmployeeInfo
  isAdminAtFacility: boolean
}

export const handler: LoggedInHealthWorkerHandler<
  HealthWorkerPageProps,
  { facility: ReturnedSqlRow<Facility>; isAdminAtFacility: boolean }
> = {
  async GET(_, ctx) {
    // get facility id
    const facility_id = parseInt(ctx.params.facilityId)
    assert(!isNaN(facility_id), 'Invalid facility ID')

    // get health worker id
    const health_worker_id = parseInt(ctx.params.id)
    assert(!isNaN(health_worker_id), 'Invalid health worker ID')

    const isAdminAtFacility = await isAdmin(ctx.state.trx, {
      facility_id: facility_id,
      health_worker_id: ctx.state.healthWorker.id,
    })

    const employee = await health_workers.getEmployeeInfo(
      ctx.state.trx,
      health_worker_id,
      facility_id,
    )

    assertOr404(
      employee,
      `Clinics/facilities not found for health worker ${health_worker_id}`,
    )

    // TODO: what if not a nurse but doctor/admin? where do we get registration info?
    // maybe should assert nurseRegistrationDetails

    return ctx.render({
      employee,
      isAdminAtFacility,
    })
  },
  async POST(req, ctx) {
    // get facility id
    const facility_id = parseInt(ctx.params.facilityId)
    assert(!isNaN(facility_id), 'Invalid facility ID')

    // get health worker id
    const health_worker_id = parseInt(ctx.params.id)
    assert(!isNaN(health_worker_id), 'Invalid health worker ID')

    const isAdminAtFacility = await isAdmin(ctx.state.trx, {
      facility_id: facility_id,
      health_worker_id: health_worker_id,
    })

    const employee = await health_workers.getEmployeeInfo(
      ctx.state.trx,
      health_worker_id,
      facility_id,
    )
    assertOr404(
      employee,
      `Clinics/facilities not found for health worker ${health_worker_id}`,
    )

    const approved = new URL(req.url).searchParams.get('approve')
    if (approved) {
      approveInvitee(ctx.state.trx, ctx.state.healthWorker.id, health_worker_id)
    }

    return ctx.render({
      employee,
      isAdminAtFacility,
    })
  },
}

export default function HealthWorkerPage(
  props: PageProps<HealthWorkerPageProps>,
) {
  const approved = props.url.searchParams.get('approve')
  const isAdmin = props.data.isAdminAtFacility
  console.log(props.data.employee.registration_completed)
  return (
    <Layout
      title={props.data.employee.name}
      route={props.route}
      url={props.url}
      avatarUrl={props.data.employee.avatar_url
        ? props.data.employee.avatar_url
        : 'avatar_url'}
      variant='standard'
    >
      <Container size='lg'>
        <ApproveSuccess
          approved={approved}
        />
        <div className='mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8 row-span-full'>
          <div className='my-6 overflow-hidden bg-slate-50'>
            <img
              className='h-20 w-20 object-cover display:inline rounded-full'
              src={''}
              alt=''
              width={48}
              height={48}
            />
            <dt className='mt-2 text-lg font-bold leading-6 text-gray-900'>
              {props.data.employee.name}
            </dt>
            <dt className='text-sm font-sm leading-6 text-gray-400'>
              {props.data.employee.employment.map((item) => (
                item.professions.join(', ')
              ))
                .join(', ')}
            </dt>
          </div>
          <SectionHeader className='mb-1'>
            Demographic Data
          </SectionHeader>
          <HealthWorkerDetailedCard
            employee={props.data.employee}
          />
        </div>
        <hr style={{ margin: '20px 0' }} />
        {isAdmin && !props.data.employee.registration_completed && (
          <form style={{ maxWidth: '800px', margin: '0 auto' }} method='POST'>
            <div
              style={{ textAlign: 'right', margin: '0 20px' }}
            >
              <Button
                id='approve'
                type='submit'
                href={`${props.url}?approve=${props.data.employee.name}`}
                className='inline-block w-max rounded-md border-0 text-white shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-white focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 h-9 p-2 self-end whitespace-nowrap grid place-items-center'
              >
                Approve
              </Button>
            </div>
          </form>
        )}
      </Container>
    </Layout>
  )
}
