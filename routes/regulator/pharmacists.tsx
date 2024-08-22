import Layout from '../../components/library/Layout.tsx'
import PharmacistsTable from '../../components/regulator/PharmacistsTable.tsx'
import * as pharmacists from '../../db/models/pharmacists.ts'
import { FreshContext } from '$fresh/server.ts'
import { LoggedInRegulator } from '../../types.ts'

export default async function PharmacistsPage(
  _req: Request,
  ctx: FreshContext<LoggedInRegulator>,
) {
  const rowsPerPage = 70
  const currentPage = parseInt(ctx.url.searchParams.get('page') ?? '1')
  const results = await pharmacists.get(
    ctx.state.trx,
    {
      page: currentPage,
      rowsPerPage,
    },
  )
  const totalPage = Math.ceil(results.totalRows / rowsPerPage)

  return (
    <Layout
      title='Pharmacists'
      route={ctx.route}
      url={ctx.url}
      regulator={ctx.state.regulator}
      params={{}}
      variant='regulator home page'
    >
      <PharmacistsTable
        pharmacists={results.pharmacists}
        pathname={ctx.url.pathname}
        rowsPerPage={rowsPerPage}
        totalRows={results.totalRows}
        currentPage={currentPage}
        totalPage={totalPage}
      />
    </Layout>
  )
}
