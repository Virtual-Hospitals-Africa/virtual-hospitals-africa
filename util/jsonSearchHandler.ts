import { assertEquals } from 'std/assert/assert_equals.ts'

import { json } from '../util/responses.ts'
import type { LoggedInHealthWorker, TrxOrDb } from '../types.ts'
import type { SearchResults } from '../db/models/_base.ts'
import { Context } from 'fresh'

export function jsonSearchHandler<
  SearchTerms,
  RenderedResult,
  Ctx extends Context<
    LoggedInHealthWorker & Record<string, never>
  > = Context<
    LoggedInHealthWorker & Record<string, never>
  >,
>(
  model: {
    search(
      trx: TrxOrDb,
      search_terms: SearchTerms,
      opts: { page: number },
    ): Promise<SearchResults<SearchTerms, RenderedResult>>
  },
  default_search_terms?:
    | Partial<SearchTerms>
    | ((
      ctx: Ctx,
    ) => SearchTerms),
  opts?: { verbose?: boolean | string },
) {
  return {
    GET(ctx: Ctx) {
      if (opts?.verbose) {
        console.log('Searching', {
          url: ctx.url,
          state: ctx.state,
        })
      }
      assertEquals(ctx.req.headers.get('accept'), 'application/json')
      let page = 1
      // deno-lint-ignore no-explicit-any
      const search_terms: any = typeof default_search_terms === 'function'
        // deno-lint-ignore no-explicit-any
        ? default_search_terms(ctx as any)
        : {
          search: '',
          ...default_search_terms,
        }

      ctx.url.searchParams.forEach((value, key) => {
        if (key === 'page') {
          page = parseInt(value) || 1
        } else if (value === 'true' || value === 'false') {
          search_terms[key] = value === 'true'
        } else {
          // TODO use zod to parse all this?
          // const as_int = parseInt(value)
          // search_terms[key] = isNaN(as_int) ? value : as_int
          search_terms[key] = value
        }
      })

      return model
        .search(ctx.state.trx, search_terms, { ...opts, page })
        .then(json)
    },
  }
}
