import { assert } from 'std/testing/asserts.ts'
import { PageProps } from '$fresh/server.ts'
import redirect from '../../../../../util/redirect.ts'
import Layout from '../../../../../components/library/Layout.tsx'
import { Container } from '../../../../../components/library/Container.tsx'
import SectionHeader from '../../../../../components/library/typography/SectionHeader.tsx'
import HealthWorkerDetailedCardProps from '../../../../../components/health_worker/DetailedCard.tsx'

import * as employment from '../../../../../db/models/employment.ts'
import * as facilities from '../../../../../db/models/facilities.ts'
import * as health_workers from '../../../../../db/models/health_workers.ts'
import * as nurse_registration_details from '../../../../../db/models/nurse_registration_details.ts'

import {
  HealthWorker,
  LoggedInHealthWorkerHandler,
  NurseRegistrationDetails,
  ReturnedSqlRow,
} from '../../../../../types.ts'

type HealthWorkerPageProps = {
  employee_positions: employment.HealthWorkerWithRegistrationState[]
  healthWorker: ReturnedSqlRow<HealthWorker>
  nurseRegistrationDetails: ReturnedSqlRow<NurseRegistrationDetails>
}

export const handler: LoggedInHealthWorkerHandler<HealthWorkerPageProps> = {
  async GET(_, ctx) {
    // get facility id
    const facility_id = parseInt(ctx.params.facilityId)
    assert(!isNaN(facility_id), 'Invalid facility ID')

    // get facility
    const facility = await facilities.get(ctx.state.trx, facility_id)
    assert(facility, `Facility ${facility_id} does not exist`)

    // get health worker id
    const health_worker_id = parseInt(ctx.params.id)
    assert(!isNaN(health_worker_id), 'Invalid health worker ID')

    // get health worker id
    const healthWorker = await health_workers.getById(
      ctx.state.trx,
      health_worker_id,
    )
    assert(
      healthWorker,
      `Health worker ${health_worker_id} does not exist`,
    )

    // get list of all employments for a health worker {health_worker_id}
    const all_employment = await employment.getByHealthWorker(
      ctx.state.trx,
      { health_worker_id: health_worker_id },
    )

    // filter for employment positions for health worker at facility {facility_id}
    // TODO: or do we want to show all positions even if they dont have that position at facility {facility_id}??
    // --> I think we show all their positions at all facilities?
    const employee_positions = all_employment.filter((employee) =>
      employee.facility_id === facility_id
    )
    if (!employee_positions) return redirect('/app')

    // get health worker's nurse registration details
    const nurseRegistrationDetails = await nurse_registration_details.get(
      ctx.state.trx,
      { healthWorkerId: health_worker_id },
    )
    assert(
      nurseRegistrationDetails,
      `Nurse registration not found for health worker ${health_worker_id}`,
    )

    // TODO: what if not a nurse but doctor/admin? where do we get registration info?
    // maybe should assert nurseRegistrationDetails

    return ctx.render({
      employee_positions,
      healthWorker,
      nurseRegistrationDetails,
    })
  },
}

export default function HealthWorkerPage(
  props: PageProps<HealthWorkerPageProps>,
) {
  return (
    <Layout
      title={props.data.healthWorker.name}
      route={props.route}
      avatarUrl={props.data.healthWorker.avatar_url}
      variant='standard'
    >
      <Container size='lg'>
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
              {props.data.healthWorker.name}
            </dt>
            <dt className='text-sm font-sm leading-6 text-gray-400'>
              {props.data.employee_positions[0].profession}
            </dt>
          </div>
          <div className='my-6 py-1 px-4 rounded-md bg-gray-300'></div>
          <SectionHeader className='mb-1'>
            Demographic Data
          </SectionHeader>
          <HealthWorkerDetailedCardProps
            employee_positions={props.data.employee_positions}
            healthWorker={props.data.healthWorker}
            nurseRegistrationDetails={props.data.nurseRegistrationDetails}
          />
        </div>
      </Container>
    </Layout>
  )
}
