import { medications } from '../../../../../db/models/medications.ts'
import { Button } from '../../../../../components/library/Button.tsx'
import { assertOr404 } from '../../../../../util/assertOr.ts'
import { LoggedInRegulator } from '../../../../../types.ts'
import { getRequiredUUIDParam } from '../../../../../util/getParam.ts'
import redirect from '../../../../../util/redirect.ts'
import { Context } from 'fresh'
import Form from '../../../../../components/library/Form.tsx'
import { RegulatorHomePageLayout } from '../../../../regulator/_middleware.tsx'
import { medication_availabilities } from '../../../../../db/models/medication_availabilities.ts'

export const handler = {
  POST: async function RecallMedication(
    ctx: Context<LoggedInRegulator>,
  ) {
    const medicine_id = getRequiredUUIDParam(ctx, 'medicine_id')

    const medication = await medications.getById(
      ctx.state.trx,
      medicine_id,
    )

    assertOr404(medication, 'Medicine not found')

    const regulator = ctx.state.regulator

    // Get the medication availability for this medication in the regulator's country
    const availability = await ctx.state.trx
      .selectFrom('medication_availabilities')
      .where('medication_id', '=', medicine_id)
      .where('country', '=', regulator.country)
      .select('id')
      .executeTakeFirst()

    assertOr404(availability, 'Medication availability not found')

    await medication_availabilities.recall(ctx.state.trx, {
      medication_availability_id: availability.id,
      regulator_id: regulator.id,
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

    const medication = await medications.getById(
      ctx.state.trx,
      medicine_id,
    )

    assertOr404(medication, 'Medicine not found')

    return (
      <div className='mt-4 divide-y divide-gray-100 text-sm leading-6 lg:col-span-7 xl:col-span-8 row-span-full'>
        Recall {medication.name} by {medication.applicant_name} ?
        <br />
        <Form method='POST'>
          <Button type='submit'>Recall</Button>
        </Form>
      </div>
    )
  },
)
