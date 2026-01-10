import { Context } from 'fresh'
import { LoggedInRegulator } from '../../../../../types.ts'
import PharmacistForm from '../../../../../islands/regulator/PharmacistForm.tsx'
import redirect from '../../../../../util/redirect.ts'
import {
  pharmacists,
  PharmacistUpsertSchema,
} from '../../../../../db/models/pharmacists.ts'
import { getRequiredUUIDParam } from '../../../../../util/getParam.ts'
import { postHandler } from '../../../../../backend/postHandler.ts'
import { RegulatorHomePageLayout } from '../../../../regulator/_middleware.tsx'

export const handler = postHandler(
  PharmacistUpsertSchema,
  async (ctx, form_values) => {
    const { country } = ctx.params
    const pharmacist_id = getRequiredUUIDParam(ctx, 'pharmacist_id')

    await pharmacists.update(ctx.state.trx, pharmacist_id, form_values)

    const success = encodeURIComponent(
      `Pharmacist updated`,
    )

    return redirect(
      `/regulator/${country}/pharmacists?success=${success}`,
    )
  },
)

export default RegulatorHomePageLayout(
  'Pharmacists',
  async function EditPharmacistPage(
    ctx: Context<LoggedInRegulator>,
  ) {
    const { country } = ctx.params
    const pharmacist_id = getRequiredUUIDParam(ctx, 'pharmacist_id')

    const pharmacist = await pharmacists.getById(
      ctx.state.trx,
      pharmacist_id,
    )
    if (!pharmacist || pharmacist.country !== country) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: `/regulator/${country}/pharmacists?error=` +
            encodeURIComponent('Pharmacist not found'),
        },
      })
    }

    return (
      <PharmacistForm form_data={pharmacist} country={ctx.params.country} />
    )
  },
)
