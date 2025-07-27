import { FreshContext } from '$fresh/server.ts'
import { LoggedInRegulator } from '../../../../../types.ts'
import PharmacistForm from '../../../../../islands/regulator/PharmacistForm.tsx'
import redirect from '../../../../../util/redirect.ts'
import { parseRequest } from '../../../../../util/parseForm.ts'
import * as pharmacists from '../../../../../db/models/pharmacists.ts'
import { getRequiredUUIDParam } from '../../../../../util/getParam.ts'
import { RegulatorHomePageLayout } from '../../../../regulator/_middleware.tsx'

export const handler = {
  async POST(req: Request, ctx: FreshContext<LoggedInRegulator>) {
    const pharmacist_id = getRequiredUUIDParam(ctx, 'pharmacist_id')
    const to_update = await parseRequest(
      ctx.state.trx,
      req,
      pharmacists.parseUpsert,
    )

    await pharmacists.update(ctx.state.trx, pharmacist_id, to_update)

    const success = encodeURIComponent(
      `Pharmacist updated`,
    )

    return redirect(
      `/regulator/pharmacists?success=${success}`,
    )
  },
}

export default RegulatorHomePageLayout(
  'Pharmacists',
  async function EditPharmacistPage(
    _req: Request,
    ctx: FreshContext<LoggedInRegulator>,
  ) {
    const pharmacist_id = getRequiredUUIDParam(ctx, 'pharmacist_id')

    const pharmacist = await pharmacists.getById(
      ctx.state.trx,
      pharmacist_id,
    )
    if (!pharmacist) {
      return new Response(null, {
        status: 302,
        headers: {
          Location: '/regulator/pharmacists?error=' +
            encodeURIComponent('Pharmacist not found'),
        },
      })
    }

    return <PharmacistForm formData={pharmacist} />
  },
)
