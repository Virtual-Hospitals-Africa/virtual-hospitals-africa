import { assertEquals } from 'std/assert/assert_equals.ts'
import { LoggedInHealthWorkerHandlerWithProps } from '../../types.ts'
import * as conditions from '../../db/models/conditions.ts'
import { json } from '../../util/responses.ts'
import { searchPage } from '../../util/searchPage.ts'

export const handler: LoggedInHealthWorkerHandlerWithProps<unknown> = {
  GET(req, ctx) {
    assertEquals(req.headers.get('accept'), 'application/json')
    const search = ctx.url.searchParams.get('search')
    const page = searchPage(ctx)
    return conditions.search(ctx.state.trx, {
      search,
      is_procedure: true,
    }, { page })
      .then(json)
  },
}
