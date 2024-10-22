import { assertEquals } from 'std/assert/assert_equals.ts'
import { LoggedInHealthWorkerHandlerWithProps } from '../types.ts'
import { json } from '../util/responses.ts'
import type { TrxOrDb } from '../types.ts'
import type { SearchResults } from '../db/models/_base.ts'

export function jsonSearchHandler<SearchTerms, RenderedResult>(
  model: {
    search(
      trx: TrxOrDb,
      search_terms: SearchTerms,
      opts: { page: number },
    ): Promise<SearchResults<SearchTerms, RenderedResult>>
  },
  default_search_terms?: Partial<SearchTerms>,
): LoggedInHealthWorkerHandlerWithProps<unknown> {
  return {
    GET(req, ctx) {
      assertEquals(req.headers.get('accept'), 'application/json')
      let page = 1
      // deno-lint-ignore no-explicit-any
      const search_terms: any = {
        search: null,
        ...default_search_terms,
      }
      ctx.url.searchParams.forEach((value, key) => {
        if (key === 'page') {
          page = parseInt(value) || 1
        } else if (value === 'true' || value === 'false') {
          search_terms[key] = value === 'true'
        } else {
          const as_int = parseInt(value)
          search_terms[key] = isNaN(as_int) ? value : as_int
        }
      })
      return model
        .search(ctx.state.trx, search_terms, { page })
        .then(json)
    },
  }
}
