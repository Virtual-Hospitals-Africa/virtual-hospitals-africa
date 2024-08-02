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

    return json(pharmacists)
  },
}

type PharmacistsProps = {
  pharmacists: RenderedPharmacist[]
}
