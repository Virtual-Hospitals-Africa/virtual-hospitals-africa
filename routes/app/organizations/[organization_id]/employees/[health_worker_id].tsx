import Layout from '../../../../../components/library/Layout.tsx'
import HealthWorkerDetailedCard from '../../../../../components/health_worker/DetailedCard.tsx'
import * as health_workers from '../../../../../db/models/health_workers.ts'
import { assertOr404 } from '../../../../../util/assertOr.ts'
import FormButtons from '../../../../../islands/form/buttons.tsx'
import { OrganizationContext } from '../_middleware.ts'
import { getRequiredUUIDParam } from '../../../../../util/getParam.ts'

export default async function EmployeePage(
  _req: Request,
  ctx: OrganizationContext,
) {
  const { trx, organization, healthWorker, isAdminAtOrganization } = ctx.state
  const health_worker_id = getRequiredUUIDParam(ctx, 'health_worker_id')

  const employee = await health_workers.getEmployeeInfo(
    trx,
    {
      health_worker_id,
      organization_id: organization.id,
    },
  )

  assertOr404(
    employee,
    `Clinics/organizations not found for health worker ${health_worker_id}`,
  )

  return (
    <Layout
      title={employee.name}
      route={ctx.route}
      url={ctx.url}
      health_worker={ctx.state.healthWorker}
      variant='practitioner home page'
    >
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
            {employee.professions.join(', ')}
          </dt>
        </div>
        <HealthWorkerDetailedCard
          employee={employee}
        />
      </div>
      <hr style={{ margin: '20px 0' }} />
      {isAdminAtOrganization &&
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
    </Layout>
  )
}
