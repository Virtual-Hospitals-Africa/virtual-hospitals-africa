import Layout from '../../components/library/Layout.tsx'
import PharmaciesTable from '../../components/regulator/PharmaciesTable.tsx'
import { LoggedInRegulator } from '../../types.ts'
import * as pharmacies from '../../db/models/pharmacies.ts'
import { FreshContext } from '$fresh/server.ts'

export default async function PharmaciesPage(
  _req: Request,
  ctx: FreshContext<LoggedInRegulator>,
) {
  const ROWS_PER_PAGE = 70
  const currentPage = parseInt(ctx.url.searchParams.get('page') ?? '1')
  const results = await pharmacies.get(
    ctx.state.trx,
    {
      page: currentPage,
      rowsPerPage: ROWS_PER_PAGE,
    },
  )
  const totalPage = Math.ceil(results.totalRows / ROWS_PER_PAGE)

  return (
    <Layout
      title='Pharmacies'
      route={ctx.route}
      url={ctx.url}
      regulator={ctx.state.regulator}
      params={ctx.params}
      variant='regulator home page'
    >
      <PharmaciesTable
        pharmacies={results.pharmacies}
        pathname={ctx.url.pathname}
        rowsPerPage={ROWS_PER_PAGE}
        totalRows={results.totalRows}
        currentPage={currentPage}
        totalPage={totalPage}
      />
    </Layout>
  )
}
