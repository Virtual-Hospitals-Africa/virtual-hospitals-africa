import { LoggedInRegulatorHandlerWithProps, RenderedMedicine } from '../../../types.ts'
import { assertOr404 } from '../../../util/assertOr.ts'
import { json } from '../../../util/responses.ts'
import { getAllWithSearchCondition } from '../../../db/models/drugs.ts'
type MedicinesProps = {
  medicines: RenderedMedicine[]
}

export const handler: LoggedInRegulatorHandlerWithProps<MedicinesProps> = {
  async GET(req, ctx) {
    assertOr404(
      req.headers.get('accept') === 'application/json',
      'We only accept JSON',
    )
    const search = ctx.url.searchParams.get('search')
    const medicationsResult = await getAllWithSearchCondition(ctx.state.trx,search)
    const medicines_with_href = medicationsResult.map((medicine) => {
        const href = `/regulator/medicines/${medicine?.id}`
        return { id: medicine?.id, name: medicine?.name, href,description:medicine.distinct_trade_names+" "+medicine.distinct_applicant_names }
      })
    return json(medicines_with_href)
  },
}


 
  