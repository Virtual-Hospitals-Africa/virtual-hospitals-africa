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
  search?: Maybe<string>,
) {
  const search_results = search
    ? await drugs.searchManufacturedMedications(ctx.state.trx, {
      search,
    })
    : []
  return json(search_results)
}

export const handler: LoggedInHealthWorkerHandlerWithProps<unknown> = {
  GET(req, ctx) {
    assertEquals(req.headers.get('accept'), 'application/json')
    const search = ctx.url.searchParams.get('search')
    return searchResponse(ctx, search)
  },
}
