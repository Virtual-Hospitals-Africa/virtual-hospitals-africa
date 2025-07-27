import manufactured_medications from '../../../../../db/models/manufactured_medications.ts'
import Layout from '../../../../../components/library/Layout.tsx'
import { Button } from '../../../../../components/library/Button.tsx'
import { assertOr404 } from '../../../../../util/assertOr.ts'
import { LoggedInRegulator } from '../../../../../types.ts'
import { getRequiredUUIDParam } from '../../../../../util/getParam.ts'
import redirect from '../../../../../util/redirect.ts'
import { FreshContext } from '$fresh/server.ts'
import Form from '../../../../../components/library/Form.tsx'

export const handler = {
  POST: async function RecallMedication(
    _req: Request,
    ctx: FreshContext<LoggedInRegulator>,
  ) {
    const medicine_id = getRequiredUUIDParam(ctx, 'medicine_id')

    const manufacturedMedication = await manufactured_medications.getById(
      ctx.state.trx,
      medicine_id,
    )

    assertOr404(manufacturedMedication, 'Medicine not found')

    const regulator_id = ctx.state.regulator.id

    await manufactured_medications.recall(ctx.state.trx, {
      manufactured_medication_id: medicine_id,
      regulator_id: regulator_id,
    })

    const success = encodeURIComponent(
      `Medication recalled`,
    )

    return redirect(
      `/regulator/medicines?success=${success}`,
    )
  },
}

export default async function RecallPage(
  _req: Request,
  ctx: FreshContext<LoggedInRegulator>,
) {
  const medicine_id = getRequiredUUIDParam(ctx, 'medicine_id')

  const manufacturedMedication = await manufactured_medications.getById(
    ctx.state.trx,
    medicine_id,
  )

  assertOr404(manufacturedMedication, 'Medicine not found')

  return (
    <Layout
      title='Confirm Recall'
      route={ctx.route}
      url={ctx.url}
      regulator={ctx.state.regulator}
      variant='regulator home page'
    >
      <div className='mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8 row-span-full'>
        Recall {manufacturedMedication.generic_name} (Trade Name:{' '}
        {manufacturedMedication.trade_name}) by{' '}
        {manufacturedMedication.applicant_name} ?
        <br />
        Strength Summary: {manufacturedMedication.strength_summary}

        <Form method='POST'>
          <Button type='submit'>Recall</Button>
        </Form>
      </div>
    </Layout>
  )
}
