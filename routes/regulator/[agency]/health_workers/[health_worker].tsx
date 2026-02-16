import HealthWorkerDetailedCard from '../../../components/regulator/DetailedCard.tsx'
import { LoggedInRegulatorContext } from '../../../types.ts'
import { getRequiredUUIDParam } from '../../../util/getParam.ts'
import { health_workers } from '../../../db/models/health_workers.ts'
import { RegulatorHomePageLayout } from '../_middleware.tsx'

export default RegulatorHomePageLayout(
  async function HealthWorkerPage(
    ctx: LoggedInRegulatorContext,
  ) {
    const health_worker_id = getRequiredUUIDParam(ctx, 'health_worker_id')
    const health_worker = await health_workers.getById(ctx.state.trx, health_worker_id)

    return {
      title: health_worker.name,
      children: (
        <div className='mt-4 text-sm leading-6 lg:col-span-7 xl:col-span-8 row-span-full'>
          <div className='my-6 overflow-hidden bg-slate-50'>
            <img
              className='h-20 w-20 object-cover display:inline rounded-full'
              src={``}
              alt=''
              width={48}
              height={48}
            />
            <dt className='mt-2 text-lg font-bold leading-6 text-gray-900'>
              {health_worker.first_names}
            </dt>
            <dt className='text-sm font-sm leading-6 text-gray-400'>
              {'HealthWorker'}
            </dt>
          </div>
          <HealthWorkerDetailedCard health_worker={health_worker} />
        </div>
      ),
    }
  },
)
