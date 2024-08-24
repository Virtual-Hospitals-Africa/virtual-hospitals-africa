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
  searchQuery: string
}

export const handler = {
  GET: async function (
    _req: Request,
    ctx: FreshContext<LoggedInRegulator>,
  ) {
    const ROWS_PER_PAGE = 100;
    const currentPage = parseInt(ctx.url.searchParams.get('page') ?? '1');
    const searchQuery = ctx.url.searchParams.get('search') ?? '';

    let result;
    if (searchQuery) {
      result = await drugs.searchAcrossPages(
        ctx.state.trx,
        searchQuery,
        currentPage,
        ROWS_PER_PAGE,
      );
    } else {
      result = await drugs.get(
        ctx.state.trx,
        currentPage,
        ROWS_PER_PAGE,
      );
    }

    return ctx.render({
      medicines: result.medicines,
      regulator: ctx.state.regulator,
      currentPage,
      totalRows: result.totalRows,
      rowsPerPage: ROWS_PER_PAGE,
      totalPage: Math.ceil(result.totalRows / ROWS_PER_PAGE),
      searchQuery,
    });
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
        medicines={props.data.medicines}
        pathname={props.url.pathname}
        rowsPerPage={props.data.rowsPerPage}
        totalRows={props.data.totalRows}
        currentPage={props.data.currentPage}
        totalPage={props.data.totalPage}
        searchQuery={props.data.searchQuery}
      />
    </Layout>
  )
}
