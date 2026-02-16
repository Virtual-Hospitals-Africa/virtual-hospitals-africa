import HealthWorkerDetailedCard from '../../../../../components/health_worker/DetailedCard.tsx'
import { assertOr404 } from '../../../../../util/assertOr.ts'
import { OrganizationContext } from '../_middleware.ts'
import { getRequiredUUIDParam } from '../../../../../util/getParam.ts'
import { HealthWorkerHomePageLayout } from '../../../_middleware.tsx'
import { employees } from '../../../../../db/models/employees.ts'

export default HealthWorkerHomePageLayout<OrganizationContext>(
  async function EmployeePage(
    ctx: OrganizationContext,
  ) {
    const { trx, organization } = ctx.state
    const health_worker_id = getRequiredUUIDParam(ctx, 'health_worker_id')

    const employee = await employees.findOne(
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

    return {
      title: employee.name,
      children: (
        <>
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
                {employee.role}
              </dt>
            </div>
            <HealthWorkerDetailedCard
              employee={employee}
            />
          </div>
          <hr style={{ margin: '20px 0' }} />
        </>
      ),
    }
  },
)
