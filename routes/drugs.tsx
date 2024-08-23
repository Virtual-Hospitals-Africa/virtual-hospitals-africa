import { assertEquals } from 'std/assert/assert_equals.ts'
import {
  LoggedInHealthWorker,
  LoggedInHealthWorkerHandlerWithProps,
  Maybe,
} from '../types.ts'
import * as drugs from '../db/models/drugs.ts'
import { json } from '../util/responses.ts'
import { FreshContext } from '$fresh/server.ts'
import db from '../db/db.ts'

export async function searchResponse(
  search?: Maybe<string>,
) {
  const medicationsResult = search
    ? await drugs.search(db, {
      search,
    })
    : []
  return json(medicationsResult)
}

export const handler: LoggedInHealthWorkerHandlerWithProps<unknown> = {
  GET(req, ctx) {
    assertEquals(req.headers.get('accept'), 'application/json')
    const search = ctx.url.searchParams.get('search')
    return searchResponse(search)
  },
}
