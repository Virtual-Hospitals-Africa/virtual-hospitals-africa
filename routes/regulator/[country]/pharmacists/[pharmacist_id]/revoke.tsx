import * as pharmacists from '../../../../../db/models/pharmacists.ts'
import { Button } from '../../../../../components/library/Button.tsx'
import { assertOr404 } from '../../../../../util/assertOr.ts'
import { LoggedInRegulator } from '../../../../../types.ts'
import { getRequiredUUIDParam } from '../../../../../util/getParam.ts'
import redirect from '../../../../../util/redirect.ts'
import { FreshContext } from '$fresh/server.ts'
import Form from '../../../../../components/library/Form.tsx'
import { RegulatorHomePageLayout } from '../../../../regulator/_middleware.tsx'

export const handler = {
  POST: async function RevokePharmacist(
    _req: Request,
    ctx: FreshContext<LoggedInRegulator>,
  ) {
    const pharmacist_id = getRequiredUUIDParam(ctx, 'pharmacist_id')

    const pharmacist = await pharmacists.getById(ctx.state.trx, pharmacist_id)

    assertOr404(pharmacist, 'Pharmacist not found')

    await pharmacists.revoke(ctx.state.trx, {
      pharmacist_id,
      regulator_id: ctx.state.regulator.id,
    })

    return redirect('/regulator/pharmacists')
  },
}

export default RegulatorHomePageLayout(
  'Pharmacist Profile',
  async function PharmacistPage(
    _req: Request,
    ctx: FreshContext<LoggedInRegulator>,
  ) {
    const pharmacist_id = getRequiredUUIDParam(ctx, 'pharmacist_id')

    const pharmacist = await pharmacists.getById(ctx.state.trx, pharmacist_id)

    assertOr404(pharmacist, 'Pharmacist not found')

    return (
      <div className='mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8 row-span-full'>
        Revoke {pharmacist.given_name} {pharmacist.family_name} ?
        <Form method='POST'>
          <Button type='submit'>Revoke</Button>
        </Form>
      </div>
    )
  },
)
