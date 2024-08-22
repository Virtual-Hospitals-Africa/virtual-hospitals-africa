import { LoggedInRegulatorHandlerWithProps } from '../../../types.ts'
import { assertOr404 } from '../../../util/assertOr.ts'
import { get } from '../../../db/models/pharmacists.ts'
import { json } from '../../../util/responses.ts'

export const handler: LoggedInRegulatorHandlerWithProps = {
  async GET(req, ctx) {
    assertOr404(
      req.headers.get('accept') === 'application/json',
      'We only accept JSON',
    )
    const name_search = ctx.url.searchParams.get('pharmacist_name')
    const results = await get(ctx.state.trx, { name_search })

    return json(results.pharmacists)
  },
}
