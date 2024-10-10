import { FreshContext } from '$fresh/server.ts'
import Layout from '../../../../components/library/Layout.tsx'
import { LoggedInRegulator } from '../../../../types.ts'
import PharmacistForm from '../../../../islands/form/PharmacistForm.tsx'
import redirect from '../../../../util/redirect.ts'
import { parseRequest } from '../../../../util/parseForm.ts'
import * as pharmacists from '../../../../db/models/pharmacists.ts'
import { getRequiredUUIDParam } from '../../../../util/getParam.ts'
import { error } from '../../../../util/alerts.ts'

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

export default async function EditPharmacistPage(
  _req: Request,
  ctx: FreshContext<LoggedInRegulator>,
) {
  const pharmacist_id = getRequiredUUIDParam(ctx, 'pharmacist_id')

  const pharmacist = await pharmacists.getById(
    ctx.state.trx,
    pharmacist_id,
  )
  if (!pharmacist) {
    return error('Pharmacist not found', '/regulator/pharmacists')
  }

  return (
    <Layout
      title='Pharmacists'
      route={ctx.route}
      url={ctx.url}
      regulator={ctx.state.regulator}
      params={ctx.params}
      variant='regulator home page'
    >
      <PharmacistForm formData={pharmacist} />
    </Layout>
  )
}
