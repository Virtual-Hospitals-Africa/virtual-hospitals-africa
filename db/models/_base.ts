import type { ReferenceExpression, SelectQueryBuilder } from 'kysely'
import type { DB } from '../../db.d.ts'
import type { TrxOrDb } from '../../types.ts'
import { assert } from 'std/assert/assert.ts'

type SearchResults<SearchTerms, RenderedResult> = {
  page: number
  rows_per_page: number
  results: RenderedResult[]
  has_next_page: boolean
  search_terms: SearchTerms
}

export function base<
  SearchTerms extends Partial<Record<string, unknown>>,
  IntermediateResult,
  Tables extends keyof DB,
  RenderedResult,
>(
  { baseQuery, handleSearch, formatResult }: {
    baseQuery: (
      trx: TrxOrDb,
      terms: SearchTerms,
    ) => SelectQueryBuilder<DB, Tables, IntermediateResult>
    handleSearch: (
      trx: TrxOrDb,
      qb: SelectQueryBuilder<DB, Tables, IntermediateResult>,
      terms: SearchTerms,
    ) => SelectQueryBuilder<DB, Tables, IntermediateResult>
    formatResult: (result: IntermediateResult) => RenderedResult
  },
) {
  return {
    async search(
      trx: TrxOrDb,
      search_terms: SearchTerms,
      opts?: {
        page?: number
        rows_per_page?: number
      },
    ): Promise<SearchResults<SearchTerms, RenderedResult>> {
      const page = opts?.page ?? 1
      const rows_per_page = opts?.rows_per_page ?? 10
      const offset = (page - 1) * rows_per_page

      let query = baseQuery(trx, search_terms as SearchTerms)
        .limit(rows_per_page + 1)
        .offset(offset)

      query = handleSearch(trx, query, search_terms)

      const intermediate_results = await query.execute()
      const results = intermediate_results.slice(0, rows_per_page).map(
        formatResult,
      )
      const has_next_page = intermediate_results.length > rows_per_page

      return {
        page,
        rows_per_page,
        results,
        has_next_page,
        search_terms,
      }
    },
    getById(trx: TrxOrDb, id: string): Promise<RenderedResult> {
      return baseQuery(trx, {} as SearchTerms)
        .where('id' as ReferenceExpression<DB, Tables>, '=', id)
        .executeTakeFirstOrThrow()
        .then(formatResult)
    },
    async getByIds(trx: TrxOrDb, ids: string[]): Promise<RenderedResult[]> {
      assert(ids.length > 0)
      const intermediate_results = await baseQuery(trx, {} as SearchTerms)
        .where('id' as ReferenceExpression<DB, Tables>, 'in', ids)
        .execute()
      return intermediate_results.map(formatResult)
    },
  }
}
