import { MedicinesTable } from '../../../components/regulator/MedicinesTable.tsx'
import { LoggedInRegulator } from '../../../types.ts'
import { medication_availabilities } from '../../../db/models/medication_availabilities.ts'
import type { Context } from 'fresh'
import { MedicinesSearch } from '../../../components/regulator/MedicinesSearch.tsx'
import Form from '../../../components/library/Form.tsx'
import { searchPage } from '../../../util/searchPage.ts'
import { RegulatorHomePageLayout } from '../../regulator/_middleware.tsx'

export default RegulatorHomePageLayout(
  'Medicines',
  async function MedicinesPage(
    ctx: Context<LoggedInRegulator>,
  ) {
    const { country } = ctx.params
    const page = searchPage(ctx)
    const search = ctx.url.searchParams.get('search')

    const search_results = await medication_availabilities.search(
      ctx.state.trx,
      { search, country },
      { page },
    )

    return (
      <Form>
        <MedicinesSearch search={search} />
        <MedicinesTable {...search_results} />
      </Form>
    )
  },
)
