import * as pharmacists from '../../../../../db/models/pharmacists.ts'
import Layout from '../../../../../components/library/Layout.tsx'

import { Button } from '../../../../../components/library/Button.tsx'
import { assertOr404 } from '../../../../../util/assertOr.ts'
import { LoggedInRegulator } from '../../../../../types.ts'
import { getRequiredUUIDParam } from '../../../../../util/getParam.ts'
import redirect from '../../../../../util/redirect.ts'
import { FreshContext } from '$fresh/server.ts'
import Form from '../../../../../components/library/Form.tsx'

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

export default async function PharmacistPage(
  _req: Request,
  ctx: FreshContext<LoggedInRegulator>,
) {
  const pharmacist_id = getRequiredUUIDParam(ctx, 'pharmacist_id')

  const pharmacist = await pharmacists.getById(ctx.state.trx, pharmacist_id)

  assertOr404(pharmacist, 'Pharmacist not found')

  return (
    <Layout
      title='Pharmacist Profile'
      route={ctx.route}
      url={ctx.url}
      regulator={ctx.state.regulator}
      variant='regulator home page'
    >
      <div className='mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8 row-span-full'>
        Revoke {pharmacist.given_name} {pharmacist.family_name} ?
        <Form method='POST'>
          <Button type='submit'>Revoke</Button>
        </Form>
      </div>
    </Layout>
  )
}
