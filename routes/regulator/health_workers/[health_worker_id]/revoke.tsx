import { health_workers } from '../../../../../db/models/health_workers.ts'
import { Button } from '../../../../../components/library/Button.tsx'
import { assertOr404 } from '../../../../../util/assertOr.ts'
import { LoggedInRegulator } from '../../../../../types.ts'
import { getRequiredUUIDParam } from '../../../../../util/getParam.ts'
import redirect from '../../../../../util/redirect.ts'
import { Context } from 'fresh'
import Form from '../../../../../components/library/Form.tsx'
import { RegulatorHomePageLayout } from '../../../../regulator/_middleware.tsx'

export const handler = {
  POST: async function RevokeHealthWorker(
    ctx: Context<LoggedInRegulator>,
  ) {
    const { country } = ctx.params
    const health_worker_id = getRequiredUUIDParam(ctx, 'health_worker_id')

    const health_worker = await health_workers.getById(ctx.state.trx, health_worker_id)

    assertOr404(health_worker, 'HealthWorker not found')

    await health_workers.revoke(ctx.state.trx, {
      health_worker_id,
      regulator_id: ctx.state.regulator.id,
    })

    return redirect(`/regulator/${country}/health_workers`)
  },
}

export default RegulatorHomePageLayout(
  'HealthWorker Profile',
  async function HealthWorkerPage(
    ctx: Context<LoggedInRegulator>,
  ) {
    const health_worker_id = getRequiredUUIDParam(ctx, 'health_worker_id')

    const health_worker = await health_workers.getById(ctx.state.trx, health_worker_id)

    assertOr404(health_worker, 'HealthWorker not found')

    return (
      <div className='mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8 row-span-full'>
        Revoke {health_worker.given_name} {health_worker.family_name} ?
        <Form method='POST'>
          <Button type='submit'>Revoke</Button>
        </Form>
      </div>
    )
  },
)
