import { LoggedInRegulatorHandlerWithProps } from '../../../types.ts'
import { assertOr404 } from '../../../util/assertOr.ts'
import * as pharmacists from '../../../db/models/pharmacists.ts'
import { json } from '../../../util/responses.ts'

export const handler: LoggedInRegulatorHandlerWithProps = {
  GET(req, ctx) {
    assertOr404(
      req.headers.get('accept') === 'application/json',
      'We only accept JSON',
    )
    const search = ctx.url.searchParams.get('search')
    return pharmacists.search(ctx.state.trx, { search })
      .then(json)
  },
}
