import type { Generated, ReferenceExpression, SelectQueryBuilder } from 'kysely'
import type { TrxOrDb } from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import { assertOr404 } from '../../util/assertOr.ts'
import type { DB } from '../../db.d.ts'

type SearchResults<SearchTerms, RenderedResult> = {
  page: number
  rows_per_page: number
  results: RenderedResult[]
  has_next_page: boolean
  search_terms: SearchTerms
}

type BaseModel<
  SearchTerms extends Partial<Record<string, unknown>>,
  RenderedResult,
> = {
  search(
    trx: TrxOrDb,
    search_terms: SearchTerms,
    opts?: {
      page?: number
      rows_per_page?: number
    },
  ): Promise<SearchResults<SearchTerms, RenderedResult>>
  getById(trx: TrxOrDb, id: string): Promise<RenderedResult>
  getByIds(trx: TrxOrDb, ids: string[]): Promise<RenderedResult[]>
}

type StandardTables = {
  [Table in keyof DB]: DB[Table] extends { id: Generated<string> | string }
    ? Table
    : never
}[keyof DB]

export function base<
  SearchTerms extends Partial<Record<string, unknown>>,
  Tables,
  SelectingFrom extends keyof Tables,
  TopLevelTable extends StandardTables,
  IntermediateResult,
  RenderedResult,
>(
  { top_level_table, baseQuery, handleSearch, formatResult }: {
    top_level_table: TopLevelTable & SelectingFrom
    baseQuery: (
      trx: TrxOrDb,
      terms: SearchTerms,
    ) => SelectQueryBuilder<Tables, SelectingFrom, IntermediateResult>
    handleSearch: (
      qb: SelectQueryBuilder<Tables, SelectingFrom, IntermediateResult>,
      terms: SearchTerms,
      trx: TrxOrDb,
    ) => SelectQueryBuilder<Tables, SelectingFrom, IntermediateResult>
    formatResult: (result: IntermediateResult) => RenderedResult
  },
): BaseModel<SearchTerms, RenderedResult> {
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

      const base_query = baseQuery(trx, search_terms as SearchTerms)
        .limit(rows_per_page + 1)
        .offset(offset)

      const search_query = handleSearch(base_query, search_terms, trx)

      const intermediate_results = await search_query.execute()
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
    async getById(trx: TrxOrDb, id: string): Promise<RenderedResult> {
      const result = await baseQuery(trx, {} as SearchTerms)
        .where(
          `${top_level_table}.id` as ReferenceExpression<Tables, SelectingFrom>,
          '=',
          id,
        )
        .executeTakeFirst()
      assertOr404(result)
      return formatResult(result)
    },
    async getByIds(trx: TrxOrDb, ids: string[]): Promise<RenderedResult[]> {
      assert(ids.length > 0)
      const intermediate_results = await baseQuery(trx, {} as SearchTerms)
        .where(
          `${top_level_table}.id` as ReferenceExpression<Tables, SelectingFrom>,
          'in',
          ids,
        )
        .execute()
      return intermediate_results.map(formatResult)
    },
  }
}
