import Layout from '../../../components/library/Layout.tsx'
import InvitePharmacistForm from '../../../islands/regulator/InvitePharmacistForm.tsx'
import { LoggedInRegulator, TrxOrDb } from '../../../types.ts'

export default async function PharmacistsInvite(
  _req: Request,
  ctx: {
    route: string
    url: URL
    state: { regulator: LoggedInRegulator['regulator']; trx: TrxOrDb }
  },
) {
const { regulator } = ctx.state
  return (
    <Layout
      title={'invite pharmacist'}
      route={ctx.route}
      url={ctx.url}
      regulator={regulator}
      params={{}}
      variant='regulator home page'
    >
      <InvitePharmacistForm/>
        
    </Layout>
  )
}