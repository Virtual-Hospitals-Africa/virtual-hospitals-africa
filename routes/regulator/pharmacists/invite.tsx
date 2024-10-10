import { FreshContext } from '$fresh/server.ts'
import PharmacistForm from '../../../islands/form/PharmacistForm.tsx'
import redirect from '../../../util/redirect.ts'
import { parseRequest } from '../../../util/parseForm.ts'
import * as pharmacists from '../../../db/models/pharmacists.ts'
import Layout from '../../../components/library/Layout.tsx'
import { LoggedInRegulator } from '../../../types.ts'

export const handler = {
  async POST(req: Request, ctx: FreshContext<LoggedInRegulator>) {
    const to_insert = await parseRequest(
      ctx.state.trx,
      req,
      pharmacists.parseUpsert,
    )

    await pharmacists.insert(ctx.state.trx, to_insert)

    const success = encodeURIComponent(
      `New pharmacist added`,
    )

    return redirect(
      `/regulator/pharmacists?success=${success}`,
    )
  },
}

// deno-lint-ignore require-await
export default async function Invite(
  _req: Request,
  ctx: FreshContext<LoggedInRegulator>,
) {
  return (
    <Layout
      title='Pharmacists'
      route={ctx.route}
      url={ctx.url}
      regulator={ctx.state.regulator}
      params={{}}
      variant='regulator home page'
    >
      <PharmacistForm formData={{}} />
    </Layout>
  )
}
