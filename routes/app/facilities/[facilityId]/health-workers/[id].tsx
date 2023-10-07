import { assert } from 'std/assert/assert.ts'
import { PageProps } from '$fresh/server.ts'
import redirect from '../../../../../util/redirect.ts'
import Layout from '../../../../../components/library/Layout.tsx'
import { Container } from '../../../../../components/library/Container.tsx'
import SectionHeader from '../../../../../components/library/typography/SectionHeader.tsx'
import HealthWorkerDetailedCard from '../../../../../components/health_worker/DetailedCard.tsx'

import * as health_workers from '../../../../../db/models/health_workers.ts'
import * as nurse_specialities from '../../../../../db/models/nurse_specialties.ts'

import {
  EmployeeInfo,
  EmploymentInfo,
  Facility,
  LoggedInHealthWorkerHandler,
  ReturnedSqlRow,
  Specialities,
} from '../../../../../types.ts'

type HealthWorkerPageProps = {
  specialities: ReturnedSqlRow<Specialities>[]
  employmentInfo: EmploymentInfo[]
  employeeInfo: EmployeeInfo
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

    const employmentInfo = await health_workers.getEmploymentInfo(
      ctx.state.trx,
      health_worker_id,
      facility_id,
    )
    assert(
      employmentInfo.length > 0,
      'Health worker ' + health_worker_id + ' does not work at facility ' +
        facility_id + '. Double check your input.',
    )

    const employeeInfo = await health_workers.getEmployeeInfo(
      ctx.state.trx,
      health_worker_id,
      facility_id,
    )
    console.log(employeeInfo)

    // console.log(employmentInfo)

    // to deal with duplicates in case user is nurse/doctor/admin at same facility
    const facility_names = new Set<string>()
    const facilityInfo: string[] = []
    employmentInfo.forEach((item) => {
      if (item.facility_name && !facility_names.has(item.facility_name)) {
        facilityInfo.push(item.facility_name + '|' + item.address)
        facility_names.add(item.facility_name)
      }
    })
    assert(
      facilityInfo.length > 0,
      `Clinics/facilities not found for health worker ${health_worker_id}`,
    )
    // get nurse specialities (empty table for now)
    const specialities = await nurse_specialities.getByHealthWorker(
      ctx.state.trx,
      { health_worker_id },
    )

    // TODO: what if not a nurse but doctor/admin? where do we get registration info?
    // maybe should assert nurseRegistrationDetails

    return ctx.render({
      specialities,
      employmentInfo,
      employeeInfo,
    })
  },
}

export default function HealthWorkerPage(
  props: PageProps<HealthWorkerPageProps>,
) {
  return (
    <Layout
      title={props.data.employeeInfo.name}
      route={props.route}
      avatarUrl={props.data.employeeInfo.avatar_url
        ? props.data.employeeInfo.avatar_url
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
              {props.data.employeeInfo.name}
            </dt>
            <dt className='text-sm font-sm leading-6 text-gray-400'>
              {props.data.employeeInfo.employment.map((item) => (
                  item.professions.join(', ')
                ))
                .join(', ')}
            </dt>
          </div>
          <SectionHeader className='mb-1'>
            Demographic Data
          </SectionHeader>
          <HealthWorkerDetailedCard
            specialities={props.data.specialities}
            employmentInfo={props.data.employmentInfo}
            employeeInfo={props.data.employeeInfo}
          />
        </div>
      </Container>
    </Layout>
  )
}
