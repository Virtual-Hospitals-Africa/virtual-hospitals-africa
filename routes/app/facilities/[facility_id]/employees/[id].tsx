import { assert } from 'std/assert/assert.ts'
import { PageProps } from '$fresh/server.ts'
import Layout from '../../../../../components/library/Layout.tsx'
import { Container } from '../../../../../components/library/Container.tsx'
import SectionHeader from '../../../../../components/library/typography/SectionHeader.tsx'
import HealthWorkerDetailedCard from '../../../../../components/health_worker/DetailedCard.tsx'

import * as health_workers from '../../../../../db/models/health_workers.ts'

import {
  EmployeeInfo,
  Facility,
  LoggedInHealthWorkerHandler,
  ReturnedSqlRow,
} from '../../../../../types.ts'
import { assertOr404 } from '../../../../../util/assertOr.ts'
import { isAdmin } from '../../../../../db/models/employment.ts'
import FormButtons from '../../../../../components/library/form/buttons.tsx'
import { HomePageSidebar } from '../../../../../components/library/Sidebar.tsx'

type EmployeePageProps = {
  facility_id: number
  employee: EmployeeInfo
  isAdminAtFacility: boolean
}

export const handler: LoggedInHealthWorkerHandler<
  EmployeePageProps,
  { facility: ReturnedSqlRow<Facility>; isAdminAtFacility: boolean }
> = {
  async GET(_, ctx) {
    // get facility id
    const facility_id = parseInt(ctx.params.facility_id)
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
      facility_id,
      employee,
      isAdminAtFacility,
    })
  },
}

export default function EmployeePage(
  props: PageProps<EmployeePageProps>,
) {
  const isAdmin = props.data.isAdminAtFacility

  return (
    <Layout
      title={props.data.employee.name}
      sidebar={<HomePageSidebar route={props.route} />}
      url={props.url}
      avatarUrl={props.data.employee.avatar_url
        ? props.data.employee.avatar_url
        : 'avatar_url'}
      variant='home page'
    >
      <Container size='lg'>
        <div className='mt-4 text-sm leading-6 lg:col-span-7 xl:col-span-8 row-span-full'>
          <div className='my-6 overflow-hidden bg-slate-50'>
            <img
              className='h-20 w-20 object-cover display:inline rounded-full'
              src={`${props.data.employee.avatar_url}`}
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
          <HealthWorkerDetailedCard
            employee={props.data.employee}
          />
        </div>
        <hr style={{ margin: '20px 0' }} />
        {isAdmin && props.data.employee.registration_pending_approval && (
          <form
            style={{ maxWidth: '200px' }}
            className='mb-5 float-right'
            method='POST'
            action={`${props.url.pathname}/approve`}
          >
            <FormButtons submitText='Approve' />
          </form>
        )}
      </Container>
    </Layout>
  )
}
