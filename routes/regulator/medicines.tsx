import Layout from '../../components/library/Layout.tsx'
import MedicinesTable from '../../components/regulator/MedicinesTable.tsx'
import { PageProps } from '$fresh/server.ts'
import { LoggedInRegulator, RenderedMedicine } from '../../types.ts'
import * as drugs from '../../db/models/drugs.ts'
import { FreshContext } from '$fresh/server.ts'

type MedicinesProps = {
  medicines: RenderedMedicine[]
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
    const ROWS_PER_PAGE = 100
    const currentPage = parseInt(ctx.url.searchParams.get('page') ?? '1')
    const { medicines, totalRows } = await drugs.get(
      ctx.state.trx,
      currentPage,
      ROWS_PER_PAGE,
    )
    return ctx.render({
      medicines: medicines,
      regulator: ctx.state.regulator,
      currentPage,
      totalRows,
      rowsPerPage: ROWS_PER_PAGE,
      totalPage: Math.ceil(totalRows / ROWS_PER_PAGE),
    })
  },
}

export default function MedicinesPage(
  props: PageProps<MedicinesProps>,
) {
  return (
    <Layout
      title='Medicines'
      route={props.route}
      url={props.url}
      regulator={props.data.regulator}
      params={{}}
      variant='regulator home page'
    >
      <MedicinesTable
        mediciens={props.data.medicines}
        pathname={props.url.pathname}
        rowsPerPage={props.data.rowsPerPage}
        totalRows={props.data.totalRows}
        currentPage={props.data.currentPage}
        totalPage={props.data.totalPage}
      />
    </Layout>
  )
}
