import Layout from '../../../components/library/Layout.tsx'
import { MedicinesTable } from '../../../components/regulator/MedicinesTable.tsx'
import { LoggedInRegulator } from '../../../types.ts'
import manufactured_medications from '../../../db/models/manufactured_medications.ts'
import type { FreshContext } from '$fresh/server.ts'
import { MedicinesSearch } from '../../../components/regulator/MedicinesSearch.tsx'
import Form from '../../../components/library/Form.tsx'
import { searchPage } from '../../../util/searchPage.ts'

export default async function MedicinesPage(
  _req: Request,
  ctx: FreshContext<LoggedInRegulator>,
) {
  const { country } = ctx.params
  const page = searchPage(ctx)
  const search = ctx.url.searchParams.get('search')

  const search_results = await manufactured_medications.search(
    ctx.state.trx,
    { search, country },
    { page },
  )

  return (
    <Layout
      title='Medicines'
      route={ctx.route}
      url={ctx.url}
      regulator={ctx.state.regulator}
      variant='regulator home page'
    >
      <Form>
        <MedicinesSearch search={search} />
        <MedicinesTable {...search_results} />
      </Form>
    </Layout>
  )
}
