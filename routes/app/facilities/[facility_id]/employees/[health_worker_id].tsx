import Layout from '../../../../../components/library/Layout.tsx'
import { Container } from '../../../../../components/library/Container.tsx'
import HealthWorkerDetailedCard from '../../../../../components/health_worker/DetailedCard.tsx'
import * as health_workers from '../../../../../db/models/health_workers.ts'
import { assertOr404 } from '../../../../../util/assertOr.ts'
import FormButtons from '../../../../../components/library/form/buttons.tsx'
import { FacilityContext } from '../_middleware.ts'
import getNumericParam from '../../../../../util/getNumericParam.ts'

export default async function EmployeePage(
  ctx: FacilityContext,
) {
  const { trx, facility, healthWorker, isAdminAtFacility } = ctx.state
  const health_worker_id = getNumericParam(ctx, 'health_worker_id')

  const employee = await health_workers.getEmployeeInfo(
    trx,
    health_worker_id,
    facility.id,
  )

  assertOr404(
    employee,
    `Clinics/facilities not found for health worker ${health_worker_id}`,
  )

  return (
    <Layout
      title={employee.name}
      route={ctx.route}
      url={ctx.url}
      avatarUrl={healthWorker.avatar_url}
      variant='home page'
    >
      <Container size='lg'>
        <div className='mt-4 text-sm leading-6 lg:col-span-7 xl:col-span-8 row-span-full'>
          <div className='my-6 overflow-hidden bg-slate-50'>
            <img
              className='h-20 w-20 object-cover display:inline rounded-full'
              src={`${employee.avatar_url}`}
              alt=''
              width={48}
              height={48}
            />
            <dt className='mt-2 text-lg font-bold leading-6 text-gray-900'>
              {employee.name}
            </dt>
            <dt className='text-sm font-sm leading-6 text-gray-400'>
              {employee.employment.find((e) => e.facility_id === facility.id)!
                .professions.join(', ')}
            </dt>
          </div>
          <HealthWorkerDetailedCard
            employee={employee}
          />
        </div>
        <hr style={{ margin: '20px 0' }} />
        {isAdminAtFacility &&
          employee.registration_pending_approval && (
          <form
            style={{ maxWidth: '200px' }}
            className='mb-5 float-right'
            method='POST'
            action={`${ctx.url.pathname}/approve`}
          >
            <FormButtons submitText='Approve' />
          </form>
        )}
      </Container>
    </Layout>
  )
}
