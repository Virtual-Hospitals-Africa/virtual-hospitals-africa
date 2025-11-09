import manufactured_medications from '../../../../../db/models/manufactured_medications.ts'
import { Button } from '../../../../../components/library/Button.tsx'
import { assertOr404 } from '../../../../../util/assertOr.ts'
import { LoggedInRegulator } from '../../../../../types.ts'
import { getRequiredUUIDParam } from '../../../../../util/getParam.ts'
import redirect from '../../../../../util/redirect.ts'
import { Context } from 'fresh'
import Form from '../../../../../components/library/Form.tsx'
import { RegulatorHomePageLayout } from '../../../../regulator/_middleware.tsx'

export const handler = {
  POST: async function RecallMedication(
    ctx: Context<LoggedInRegulator>,
  ) {
    const medicine_id = getRequiredUUIDParam(ctx, 'medicine_id')

    const manufactured_medication = await manufactured_medications.getById(
      ctx.state.trx,
      medicine_id,
    )

    assertOr404(manufactured_medication, 'Medicine not found')

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

export default RegulatorHomePageLayout(
  'Confirm Recall',
  async function RecallPage(
    ctx: Context<LoggedInRegulator>,
  ) {
    const medicine_id = getRequiredUUIDParam(ctx, 'medicine_id')

    const manufactured_medication = await manufactured_medications.getById(
      ctx.state.trx,
      medicine_id,
    )

    assertOr404(manufactured_medication, 'Medicine not found')

    return (
      <div className='mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8 row-span-full'>
        Recall {manufactured_medication.generic_name} (Trade Name:{' '}
        {manufactured_medication.trade_name}) by{' '}
        {manufactured_medication.applicant_name} ?
        <br />
        Strength Summary: {manufactured_medication.strength_summary}

        <Form method='POST'>
          <Button type='submit'>Recall</Button>
        </Form>
      </div>
    )
  },
)
