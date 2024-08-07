import Layout from '../../components/library/Layout.tsx'
import PharmacistsTable, {
  Pharmacist,
} from '../../components/regulator/PharmacistsTable.tsx'
import * as pharmacists from '../../db/models/pharmacists.ts'
import { FreshContext } from '$fresh/server.ts'
import { PageProps } from '$fresh/server.ts'
import { LoggedInRegulator } from '../../types.ts'

type PharmacistsProps = {
  pharmacists: Pharmacist[]
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
    const { pharmacistsList, totalRows } = await pharmacists.get(
      ctx.state.trx,
      {},
      currentPage,
      ROWS_PER_PAGE,
    )
    return ctx.render({
      pharmacists: pharmacistsList,
      regulator: ctx.state.regulator,
      currentPage,
      totalRows,
      rowsPerPage: ROWS_PER_PAGE,
      totalPage: Math.ceil(totalRows / ROWS_PER_PAGE),
    })
  },
}

export default function PharmacistsPage(
  props: PageProps<PharmacistsProps>,
) {
  console.log('props.data.pharmacists', props.data.pharmacists)
  return (
    <Layout
      title='Pharmacists'
      route={props.route}
      url={props.url}
      regulator={props.data.regulator}
      params={{}}
      variant='regulator home page'
    >
      <PharmacistsTable
        pharmacists={props.data.pharmacists}
        pathname={props.url.pathname}
        rowsPerPage={props.data.rowsPerPage}
        totalRows={props.data.totalRows}
        currentPage={props.data.currentPage}
        totalPage={props.data.totalPage}
      />
    </Layout>
  )
}
