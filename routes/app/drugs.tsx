import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  LoggedInHealthWorker,
  LoggedInHealthWorkerHandlerWithProps,
  Maybe,
} from '../../types.ts'
import * as drugs from '../../db/models/drugs.ts'
import { json } from '../../util/responses.ts'
import { FreshContext } from '$fresh/server.ts'

export async function searchResponse(
  ctx: FreshContext<LoggedInHealthWorker>,
  opts: {
    search?: Maybe<string>
    include_recalled?: Maybe<boolean>
  },
) {
  const medicationsResult = await drugs.search(ctx.state.trx, opts)
  return json(medicationsResult)
}

export const handler: LoggedInHealthWorkerHandlerWithProps<unknown> = {
  GET(req, ctx) {
    assertEquals(req.headers.get('accept'), 'application/json')
    const search = ctx.url.searchParams.get('search')
    const include_recalled = ctx.url.searchParams.has('include_recalled')
    return searchResponse(ctx, { search, include_recalled })
  },
}
