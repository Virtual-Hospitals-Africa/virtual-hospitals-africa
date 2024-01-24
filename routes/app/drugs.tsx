import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  LoggedInHealthWorker,
  LoggedInHealthWorkerHandlerWithProps,
} from '../../types.ts'
import * as drugs from '../../db/models/drugs.ts'
import { json } from '../../util/responses.ts'
import { HandlerContext } from '$fresh/server.ts'

export async function searchResponse(
  ctx: HandlerContext<
    unknown,
    LoggedInHealthWorker & Record<string, never>,
    unknown
  >,
  search?: string,
) {
  const medicationsResult = await drugs.search(ctx.state.trx, {
    search,
  })
  return json(medicationsResult)
}

export const handler: LoggedInHealthWorkerHandlerWithProps<unknown> = {
  GET(req, ctx) {
    assertEquals(req.headers.get('accept'), 'application/json')
    const search = new URL(req.url).searchParams.get('search') || undefined
    return searchResponse(ctx, search)
  },
}
