import { FreshContext } from '$fresh/server.ts'
import PharmacistForm from '../../../islands/form/PharmacistForm.tsx'
import { PageProps } from '$fresh/server.ts'
import redirect from '../../../util/redirect.ts'
import { parseRequestAsserts } from '../../../util/parseForm.ts'
import * as pharmacists from '../../../db/models/pharmacists.ts'
import Layout from '../../../components/library/Layout.tsx'
import { LoggedInRegulator } from '../../../types.ts'

type InviteProps = {
  regulator: LoggedInRegulator['regulator']
}

export const handler = {
  POST: async function (req: Request, ctx: FreshContext<LoggedInRegulator>) {
    const to_insert = await parseRequestAsserts(
      ctx.state.trx,
      req,
      pharmacists.isUpsert,
    )
    console.log('to_insert', to_insert)
    await pharmacists.insert(ctx.state.trx, to_insert)

    const success = encodeURIComponent(
      `New pharmacist added`,
    )

    return redirect(
      `/regulator/pharmacists?success=${success}`,
    )
  },
  GET: function (
    _req: Request,
    ctx: FreshContext<LoggedInRegulator>,
  ) {
    return ctx.render({
      regulator: ctx.state.regulator,
    })
  },
}

export default function Invite(
  props: PageProps<InviteProps>,
) {
  return (
    <Layout
      title='Pharmacists'
      route={props.route}
      url={props.url}
      regulator={props.data.regulator}
      params={{}}
      variant='regulator home page'
    >
      <PharmacistForm formData={{}} />
    </Layout>
  )
}
