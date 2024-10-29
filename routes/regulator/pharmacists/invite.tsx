import { FreshContext } from '$fresh/server.ts'
import PharmacistForm from '../../../islands/regulator/PharmacistForm.tsx'
import redirect from '../../../util/redirect.ts'
import { parseRequest } from '../../../util/parseForm.ts'
import * as pharmacists from '../../../db/models/pharmacists.ts'
import Layout from '../../../components/library/Layout.tsx'
import { LoggedInRegulator, RenderedPharmacist } from '../../../types.ts'
import compact from '../../../util/compact.ts'

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
export default async function InvitePage(
  _req: Request,
  ctx: FreshContext<LoggedInRegulator>,
) {
  const name = ctx.url.searchParams.get('name')
  const licence_number = ctx.url.searchParams.get('licence_number')
  const form_data: Partial<RenderedPharmacist> = {}
  if (name) {
    const names = compact(name.split(' ').map((n) => n.trim()))
    if (names.length === 1) {
      form_data.family_name = names[0]
    } else {
      form_data.given_name = names[0]
      form_data.family_name = names.slice(1).join(' ')
    }
  }
  if (licence_number) {
    form_data.licence_number = licence_number
  }

  return (
    <Layout
      title='Pharmacists'
      route={ctx.route}
      url={ctx.url}
      regulator={ctx.state.regulator}
      variant='regulator home page'
    >
      <PharmacistForm formData={form_data} />
    </Layout>
  )
}
