import type { Generated, ReferenceExpression, SelectQueryBuilder } from 'kysely'
import type { IdSelection, TrxOrDb } from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import { assertOr404 } from '../../util/assertOr.ts'
import type { DB, Int8 } from '../../db.d.ts'
import { bindAll } from '../../util/bindAll.ts'
import { asCompiledSql } from '../helpers.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'

export type SearchResults<SearchTerms, RenderedResult> = {
  page: number
  rows_per_page: number
  results: RenderedResult[]
  has_next_page: boolean
  search_terms: SearchTerms
}

// deno-lint-ignore no-explicit-any
export type QueryResult<Func extends (...args: any[]) => any> =
  // deno-lint-ignore no-explicit-any
  ReturnType<Func> extends SelectQueryBuilder<any, any, infer Result> ? Result
    : never

export type BaseModelInput<
  SearchTerms extends Partial<Record<string, unknown>>,
  Tables,
  SelectingFrom extends keyof Tables,
  TopLevelTable extends StandardTables,
  IntermediateResult,
  RenderedResult,
> = {
  top_level_table: TopLevelTable & SelectingFrom
  baseQuery: (
    trx: TrxOrDb,
    terms: SearchTerms,
  ) => SelectQueryBuilder<Tables, SelectingFrom, IntermediateResult>
  handleSearch?: (
    qb: SelectQueryBuilder<Tables, SelectingFrom, IntermediateResult>,
    terms: SearchTerms,
    trx: TrxOrDb,
  ) => SelectQueryBuilder<Tables, SelectingFrom, IntermediateResult>
  formatResult: (result: IntermediateResult) => RenderedResult
}

type BaseModel<
  Tables,
  SelectingFrom extends keyof Tables,
  IntermediateResult,
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
  searchQuery(
    trx: TrxOrDb,
    search_terms: SearchTerms,
  ): SelectQueryBuilder<Tables, SelectingFrom, IntermediateResult>
  findOne(trx: TrxOrDb, terms: SearchTerms): Promise<RenderedResult>
  findOneOptional(
    trx: TrxOrDb,
    terms: SearchTerms,
  ): Promise<RenderedResult | null>
  findAll(
    trx: TrxOrDb,
    search_terms: SearchTerms,
  ): Promise<RenderedResult[]>
  getById(trx: TrxOrDb, id: string | IdSelection): Promise<RenderedResult>
  getByIdOptional(
    trx: TrxOrDb,
    id: string | IdSelection,
  ): Promise<RenderedResult | null>
  getByIds(trx: TrxOrDb, ids: string[] | IdSelection): Promise<RenderedResult[]>
}
type StandardTables = {
  [Table in keyof DB]: DB[Table] extends
    { id: Generated<string> | string | Int8 } ? Table
    : never
}[keyof DB]

export type SearchResult<
  BM extends BaseModel<
    // deno-lint-ignore no-explicit-any
    any,
    // deno-lint-ignore no-explicit-any
    any,
    unknown,
    Partial<Record<string, unknown>>,
    // deno-lint-ignore no-explicit-any
    Record<string, any>
  >,
> = Awaited<
  ReturnType<BM['search']>
>['results'][number]

export function base<
  SearchTerms extends Partial<Record<string, unknown>>,
  Tables,
  SelectingFrom extends keyof Tables,
  TopLevelTable extends StandardTables,
  IntermediateResult,
  RenderedResult,
  Extra extends Record<string, unknown>,
>(
  input:
    & BaseModelInput<
      SearchTerms,
      Tables,
      SelectingFrom,
      TopLevelTable,
      IntermediateResult,
      RenderedResult
    >
    & Extra,
):
  & BaseModel<
    Tables,
    SelectingFrom,
    IntermediateResult,
    SearchTerms,
    RenderedResult
  >
  & BaseModelInput<
    SearchTerms,
    Tables,
    SelectingFrom,
    TopLevelTable,
    IntermediateResult,
    RenderedResult
  >
  & Extra {
  const { top_level_table, baseQuery, handleSearch, formatResult } = input

  const base_query_consumes_search = baseQuery.length === 2
  if (base_query_consumes_search) {
    assert(
      !handleSearch,
      'handleSearch must not be provided if baseQuery consumes search terms',
    )
  } else {
    assert(
      handleSearch,
      'handleSearch must be provided if baseQuery does not consumes search terms',
    )
  }

  return bindAll({
    ...input,
    searchQuery(
      trx: TrxOrDb,
      search_terms: SearchTerms,
    ): SelectQueryBuilder<Tables, SelectingFrom, IntermediateResult> {
      const query = baseQuery(trx, search_terms as SearchTerms)
      return handleSearch ? handleSearch(query, search_terms, trx) : query
    },
    async findAll(
      trx: TrxOrDb,
      search_terms: SearchTerms,
    ): Promise<RenderedResult[]> {
      const { results } = await this.search(trx, search_terms, {
        rows_per_page: Infinity,
      })
      return results
    },
    async search(
      trx: TrxOrDb,
      search_terms: SearchTerms,
      opts?: {
        page?: number
        rows_per_page?: number
        verbose?: boolean | string
      },
    ): Promise<SearchResults<SearchTerms, RenderedResult>> {
      const page = opts?.page ?? 1
      const rows_per_page = opts?.rows_per_page ?? 10

      let query = this.searchQuery(trx, search_terms as SearchTerms)
      if (rows_per_page === Infinity) {
        assertEquals(page, 1)
      } else {
        const offset = (page - 1) * rows_per_page
        query = query.limit(rows_per_page + 1).offset(offset)
      }

      if (opts?.verbose) {
        if (typeof opts.verbose === 'string') {
          console.log(opts.verbose)
        }
      }

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
    async findOne(trx: TrxOrDb, terms: SearchTerms): Promise<RenderedResult> {
      const query = this.searchQuery(trx, terms).limit(2)
      const results = await query.execute()
      if (results.length > 1) {
        console.error(asCompiledSql(query))
        throw new Error('More than one result returned')
      }
      if (results.length === 0) {
        console.error(asCompiledSql(query))
        throw new Error('No results returned')
      }
      return formatResult(results[0])
    },
    async findOneOptional(
      trx: TrxOrDb,
      terms: SearchTerms,
    ): Promise<RenderedResult | null> {
      const query = this.searchQuery(trx, terms).limit(2)
      const results = await query.execute()
      if (results.length === 0) return null
      if (results.length > 1) {
        console.error(asCompiledSql(query))
        throw new Error('More than one result returned')
      }
      return formatResult(results[0])
    },
    async getById(
      trx: TrxOrDb,
      id: string | IdSelection,
    ): Promise<RenderedResult> {
      const result = await this.getByIdOptional(trx, id)
      assertOr404(result)
      return result
    },
    async getByIdOptional(
      trx: TrxOrDb,
      id: string | IdSelection,
    ): Promise<RenderedResult | null> {
      const query = baseQuery(trx, {} as SearchTerms)
        .where(
          `${top_level_table}.id` as ReferenceExpression<Tables, SelectingFrom>,
          '=',
          id,
        )
        .limit(2)
      const results = await query.execute()
      if (results.length === 0) return null
      if (results.length > 1) {
        console.error(asCompiledSql(query))
        throw new Error('Expected query to return a unique result')
      }
      return formatResult(results[0])
    },
    async getByIds(
      trx: TrxOrDb,
      ids: string[] | IdSelection,
    ): Promise<RenderedResult[]> {
      if (Array.isArray(ids)) {
        assert(ids.length > 0)
      }
      const intermediate_results = await baseQuery(trx, {} as SearchTerms)
        .where(
          `${top_level_table}.id` as ReferenceExpression<Tables, SelectingFrom>,
          'in',
          ids,
        )
        .execute()
      return intermediate_results.map(formatResult)
    },
  })
}
