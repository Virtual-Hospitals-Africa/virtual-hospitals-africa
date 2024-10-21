import { assertEquals } from 'std/assert/assert_equals.ts'
import { LoggedInHealthWorkerHandlerWithProps } from '../../types.ts'
import * as drugs from '../../db/models/drugs.ts'
import { json } from '../../util/responses.ts'
import { searchPage } from '../../util/searchPage.ts'

export const handler: LoggedInHealthWorkerHandlerWithProps<unknown> = {
  GET(req, ctx) {
    assertEquals(req.headers.get('accept'), 'application/json')
    const search = ctx.url.searchParams.get('search')
    const page = searchPage(ctx)
    const include_recalled = ctx.url.searchParams.has('include_recalled')
    return drugs.search(ctx.state.trx, { search, page, include_recalled }).then(
      json,
    )
  },
}
