import { assertEquals } from 'std/assert/assert_equals.ts'
import { LoggedInHealthWorkerHandlerWithProps } from '../../types.ts'
import * as facilities from '../../db/models/facilities.ts'
import { json } from '../../util/responses.ts'
import { assertOr400 } from '../../util/assertOr.ts'

function assertKind(
  kind: unknown,
): asserts kind is 'physical' | 'virtual' | null {
  if (kind === null) return
  assertOr400(kind === 'physical' || kind === 'virtual', 'Invalid kind')
}

export const handler: LoggedInHealthWorkerHandlerWithProps<unknown> = {
  async GET(req, { state, url }) {
    assertEquals(req.headers.get('accept'), 'application/json')
    const search = url.searchParams.get('search')
    const kind = url.searchParams.get('kind')
    assertKind(kind)
    const result = await facilities.search(state.trx, {
      search,
      kind,
    })
    return json(result)
  },
}
