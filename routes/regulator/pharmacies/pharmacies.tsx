import * as pharmacies from '../../../db/models/pharmacies.ts'
import { LoggedInRegulatorHandlerWithProps } from '../../../types.ts'
import { assertOr404 } from '../../../util/assertOr.ts'
import { json } from '../../../util/responses.ts'

export const handler: LoggedInRegulatorHandlerWithProps = {
  async GET(req, ctx) {
    assertOr404(
      req.headers.get('accept') === 'application/json',
      'We only accept JSON',
    )
    const search = ctx.url.searchParams.get('search')
    const results = await pharmacies.get(ctx.state.trx, {
      search,
    })

    return json(results.pharmacies)
  },
}
