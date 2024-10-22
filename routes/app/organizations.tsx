import { assertEquals } from 'std/assert/assert_equals.ts'
import { LoggedInHealthWorkerHandlerWithProps } from '../../types.ts'
import * as organizations from '../../db/models/organizations.ts'
import { json } from '../../util/responses.ts'
import { assertOr400 } from '../../util/assertOr.ts'
import { searchPage } from '../../util/searchPage.ts'

function assertKind(
  kind: unknown,
): asserts kind is 'physical' | 'virtual' | null {
  if (kind === null) return
  assertOr400(kind === 'physical' || kind === 'virtual', 'Invalid kind')
}

export const handler: LoggedInHealthWorkerHandlerWithProps<unknown> = {
  async GET(req, ctx) {
    assertEquals(req.headers.get('accept'), 'application/json')
    const page = searchPage(ctx)
    const search = ctx.url.searchParams.get('search')
    const kind = ctx.url.searchParams.get('kind')
    assertKind(kind)
    const result = await organizations.search(ctx.state.trx, {
      search,
      kind,
    }, { page })
    return json(result)
  },
}
