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
  Specialties,
} from '../../../../../types.ts'
import { assertOr404 } from '../../../../../util/assertOr.ts'

type HealthWorkerPageProps = {
  employee: EmployeeInfo
}

export const handler: LoggedInHealthWorkerHandler<
  HealthWorkerPageProps,
  { facility: ReturnedSqlRow<Facility> }
> = {
  async GET(_, ctx) {
    // get facility id
    const facility_id = parseInt(ctx.params.facilityId)
    assert(!isNaN(facility_id), 'Invalid facility ID')

    // get health worker id
    const health_worker_id = parseInt(ctx.params.id)
    assert(!isNaN(health_worker_id), 'Invalid health worker ID')

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
    })
  },
}

export default function HealthWorkerPage(
  props: PageProps<HealthWorkerPageProps>,
) {
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
      </Container>
    </Layout>
  )
}
