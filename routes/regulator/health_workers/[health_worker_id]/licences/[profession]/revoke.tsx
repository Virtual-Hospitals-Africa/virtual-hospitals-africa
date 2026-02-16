import { Context } from 'fresh'
import { Button } from '../../../../../../components/library/Button.tsx'
import Form from '../../../../../../components/library/Form.tsx'
import { LoggedInRegulator } from '../../../../../../types.ts'
import { assertOrRedirect } from '../../../../../../util/assertOr.ts'
import { getRequiredParam, getRequiredUUIDParam } from '../../../../../../util/getParam.ts'
import redirect from '../../../../../../util/redirect.ts'
import { RegulatorHomePageLayout } from '../../../../_middleware.tsx'
import { health_worker_licences } from '../../../../../../db/models/health_worker_licences.ts'
import { SERVER_COUNTRY } from '../../../../../../db/models/countries.ts'
import { postHandler } from '../../../../../../backend/postHandler.ts'
import z from 'zod'
import { profession } from '../../../../../../util/validators.ts'
import { country_health_workers } from '../../../../../../db/models/country_health_workers.ts'
import matching from '../../../../../../util/matching.ts'
import { warning } from '../../../../../../util/alerts.ts'

export const handler = postHandler(
  z.object({}),
  async (ctx, _form_values) => {
    await health_worker_licences.revoke(ctx.state.trx, {
      revoked_by: ctx.state.regulator.id,
      country: SERVER_COUNTRY,
      health_worker_id: getRequiredUUIDParam(ctx, 'health_worker_id'),
      profession: profession.parse(getRequiredUUIDParam(ctx, 'profession')),
    })

    return redirect(`/regulator/health_workers?success=Licence+revoked`)
  },
)

export default RegulatorHomePageLayout(
  'Revoke Licence',
  async function HealthWorkerPage(
    ctx: Context<LoggedInRegulator>,
  ) {
    const health_worker_id = getRequiredUUIDParam(ctx, 'health_worker_id')
    const profession = getRequiredParam(ctx, 'profession')

    const health_worker = await country_health_workers.getById(ctx.state.trx, health_worker_id)

    const matching_licence = health_worker.licences.find(matching({ profession }))

    assertOrRedirect(
      matching_licence,
      warning(`${health_worker.name} is not licensed as a ${profession}`, `/regulator/health_workers?warning=${health_worker.name}`),
    )

    return (
      <div className='mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8 row-span-full'>
        Revoke {health_worker.first_names} {health_worker.surname} as a {profession}? Licence number: {matching_licence.licence_number}
        <Form method='POST'>
          <Button type='submit'>Revoke</Button>
        </Form>
      </div>
    )
  },
)
