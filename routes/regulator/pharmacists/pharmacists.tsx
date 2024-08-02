import {
  LoggedInRegulatorHandlerWithProps,
  RenderedPharmacist,
} from '../../../types.ts'

import { assertOr404 } from '../../../util/assertOr.ts'
import { getAllWithSearchConditions } from '../../../db/models/pharmacists.ts'
import { json } from '../../../util/responses.ts'

export const handler: LoggedInRegulatorHandlerWithProps<PharmacistsProps> = {
  async GET(req, ctx) {
    assertOr404(
      req.headers.get('accept') === 'application/json',
      'We only accept JSON',
    )
    const search = ctx.url.searchParams.get('search')
    const pharmacists = await getAllWithSearchConditions(ctx.state.trx, search)

    const pharmacists_with_href = pharmacists.map((pharmacist) => {
      const href = `/regulator/pharmacists/${pharmacist?.id}`
      return { id: pharmacist?.id, name: pharmacist?.given_name, href, description: pharmacist?.address }
    })
    return json(pharmacists_with_href)
  },
}

type PharmacistsProps = {
  pharmacists: RenderedPharmacist[]
}
