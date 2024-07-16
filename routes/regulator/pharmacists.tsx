import Layout from '../../components/library/Layout.tsx'
import PharmacistsTable from '../../components/regulator/PharmacistsTable.tsx'
import { LoggedInRegulator, TrxOrDb } from '../../types.ts'
import * as pharmacistsService from '../../db/models/pharmacists.ts'

export default async function PharmacistsPage(
  _req: Request,
  ctx: {
    route: string
    url: URL
    state: { regulator: LoggedInRegulator['regulator']; trx: TrxOrDb }
  },
) {
  const { regulator } = ctx.state

  const pharmacists = await pharmacistsService.get(ctx.state.trx)

  return (
    <Layout
      title='Pharmacists'
      route={ctx.route}
      url={ctx.url}
      regulator={regulator}
      params={{}}
      variant='regulator home page'
    >
      <PharmacistsTable
        pharmacists={pharmacists}
        pathname={ctx.url.pathname}
      />
    </Layout>
  )
}
