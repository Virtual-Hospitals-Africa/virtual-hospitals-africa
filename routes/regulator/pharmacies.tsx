import Layout from '../../components/library/Layout.tsx'
import PharmaciesTable from '../../components/regulator/PharmaciesTable.tsx'
import { PageProps } from '$fresh/server.ts'
import { LoggedInRegulator, RenderedPharmacy } from '../../types.ts'
import * as pharmacies from '../../db/models/pharmacies.ts'
import { FreshContext } from '$fresh/server.ts'

type PharmaciesProps = {
  pharmacies: RenderedPharmacy[]
  regulator: LoggedInRegulator['regulator']
  page: number
  totalRows: number
  rowsPerPage: number
  totalPage: number
  currentPage: number
}

export const handler = {
  GET: async function (
    _req: Request,
    ctx: FreshContext<LoggedInRegulator>,
  ) {
    const ROWS_PER_PAGE = 70
    const currentPage = parseInt(ctx.url.searchParams.get('page') ?? '1')
    const { pharmaciesList, totalRows } = await pharmacies.get(
      ctx.state.trx,
      currentPage,
      ROWS_PER_PAGE,
    )
    return ctx.render({
      pharmacies: pharmaciesList,
      regulator: ctx.state.regulator,
      currentPage,
      totalRows,
      rowsPerPage: ROWS_PER_PAGE,
      totalPage: Math.ceil(totalRows / ROWS_PER_PAGE),
    })
  },
}

export default function PharmaciesPage(
  props: PageProps<PharmaciesProps>,
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
      <PharmaciesTable
        pharmacies={props.data.pharmacies}
        pathname={props.url.pathname}
        rowsPerPage={props.data.rowsPerPage}
        totalRows={props.data.totalRows}
        currentPage={props.data.currentPage}
        totalPage={props.data.totalPage}
      />
    </Layout>
  )
}
