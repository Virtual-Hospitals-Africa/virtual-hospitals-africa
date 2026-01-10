import { LRU } from 'tiny-lru'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import type { Generated, ReferenceExpression, SelectQueryBuilder } from 'kysely'
import type {
  IdSelection,
  InsertShape,
  SearchResults,
  SelectShape,
  TrxOrDb,
  UpdateShape,
} from '../../types.ts'
import { assertOr404 } from '../../util/assertOr.ts'
import type { DB, Int8 } from '../../db.d.ts'
import { bindAll } from '../../util/bindAll.ts'
import { asCompiledSql, debugLog } from '../helpers.ts'
import isString from '../../util/isString.ts'

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
  verbose?: boolean
  caching?: {
    number_of_items: number
    cache_writes?: boolean
  }
}

export function identity<T>(obj: T) {
  return obj
}

// Marker symbol to identify simple base queries
const SIMPLE_BASE_QUERY = Symbol('simpleBaseQuery')

/**
 * Creates a simple base query that just does .selectFrom(table).selectAll().
 * When used with `identity` as formatResult, enables caching of inserts and updates
 * since the inserted/updated row matches the query result shape exactly.
 *
 * Usage:
 * ```ts
 * const model = base({
 *   top_level_table: 'my_table',
 *   baseQuery: simpleBaseQuery('my_table'),
 *   formatResult: identity,
 *   // ...
 * })
 * ```
 */
export function simpleBaseQuery<TableName extends StandardTables>(
  table_name: TableName,
): (
  trx: TrxOrDb,
) => SelectQueryBuilder<DB, TableName, SelectShape<DB[TableName]>> {
  const fn = (trx: TrxOrDb) =>
    trx.selectFrom(table_name).selectAll() as unknown as SelectQueryBuilder<
      DB,
      TableName,
      SelectShape<DB[TableName]>
    >
  ;(fn as { [SIMPLE_BASE_QUERY]?: true })[SIMPLE_BASE_QUERY] = true
  return fn
}

function isSimpleBaseQuery(
  fn: unknown,
): boolean {
  return typeof fn === 'function' && SIMPLE_BASE_QUERY in fn
}

type BaseModel<
  Tables,
  TopLevelTable extends StandardTables,
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
  findFirst(trx: TrxOrDb, terms: SearchTerms): Promise<RenderedResult>
  findFirstOptional(
    trx: TrxOrDb,
    terms: SearchTerms,
  ): Promise<RenderedResult | null>
  findOne(trx: TrxOrDb, terms: SearchTerms): Promise<RenderedResult>
  findOneOptional(
    trx: TrxOrDb,
    terms: SearchTerms,
  ): Promise<RenderedResult | null>
  findAll(
    trx: TrxOrDb,
    search_terms: SearchTerms,
  ): Promise<RenderedResult[]>
  insertOne(
    trx: TrxOrDb,
    to_insert: InsertShape<DB[TopLevelTable]>,
  ): Promise<string>
  getById(trx: TrxOrDb, id: string | IdSelection): Promise<RenderedResult>
  getByIdOptional(
    trx: TrxOrDb,
    id: string | IdSelection,
  ): Promise<RenderedResult | null>
  getByIds(trx: TrxOrDb, ids: string[] | IdSelection): Promise<RenderedResult[]>
  updateById(
    trx: TrxOrDb,
    id: string,
    updates: UpdateShape<DB[TopLevelTable]>,
  ): Promise<unknown>
  distinctIds(
    trx: TrxOrDb,
    search_terms: SearchTerms,
    ref?: Parameters<
      SelectQueryBuilder<Tables, SelectingFrom, IntermediateResult>['select']
    >[0],
  ): IdSelection
  countAll(trx: TrxOrDb, search_terms: SearchTerms): Promise<number>
  removeById(trx: TrxOrDb, id: string): Promise<void>
  getFromCache(id: string): RenderedResult | undefined
  setCache(id: string, result: RenderedResult): void
  invalidateCacheOne(id: string): void
  invalidateCacheAll(): void
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
    TopLevelTable,
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
  const {
    top_level_table,
    baseQuery,
    formatResult,
    caching,
  } = input

  const base_query_consumes_search = baseQuery.length === 2
  let handleSearch: NonNullable<typeof input.handleSearch>

  if (base_query_consumes_search) {
    assert(
      !input.handleSearch,
      'handleSearch must not be provided if baseQuery consumes search terms',
    )
    handleSearch = (qb) => qb
  } else {
    assert(
      input.handleSearch,
      'handleSearch must be provided if baseQuery does not consumes search terms',
    )
    handleSearch = input.handleSearch
  }

  const cache_writes = !!caching?.cache_writes
  if (cache_writes) {
    assert(
      formatResult === identity,
      'In order to cache_writes there can be no transformation of the object returned from the DB',
    )
    assert(
      isSimpleBaseQuery(baseQuery),
      'In order to cache_writes there can be no joins, just returnAll from the DB',
    )
  }

  const _lru: null | LRU = caching
    ? new LRU<RenderedResult>(caching.number_of_items)
    : null

  const lru = {
    get(id: string | IdSelection) {
      return isString(id) ? _lru?.get(id) : undefined
    },
    set(id: string | IdSelection, value: RenderedResult) {
      if (isString(id)) _lru?.set(id, value)
    },
    delete(id: string) {
      _lru?.delete(id)
    },
    clear() {
      _lru?.clear()
    },
  }

  return bindAll({
    ...input,
    buildQuery(
      trx: TrxOrDb,
      search_terms: SearchTerms,
      callback: (
        qb: SelectQueryBuilder<Tables, SelectingFrom, IntermediateResult>,
      ) => SelectQueryBuilder<Tables, SelectingFrom, IntermediateResult>,
    ): SelectQueryBuilder<Tables, SelectingFrom, IntermediateResult> {
      const query = callback(baseQuery(trx, search_terms))
      // TODO: log up a level
      if (this.verbose) {
        debugLog(query)
      }
      return query
    },
    searchQuery(
      trx: TrxOrDb,
      search_terms: SearchTerms,
      callback: (
        qb: SelectQueryBuilder<Tables, SelectingFrom, IntermediateResult>,
      ) => SelectQueryBuilder<Tables, SelectingFrom, IntermediateResult> = (
        qb,
      ) => qb,
    ): SelectQueryBuilder<Tables, SelectingFrom, IntermediateResult> {
      return this.buildQuery(
        trx,
        search_terms,
        (qb) => callback(handleSearch(qb, search_terms, trx)),
      )
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

      const query = this.searchQuery(trx, search_terms as SearchTerms, (qb) => {
        if (rows_per_page === Infinity) {
          assertEquals(page, 1)
          return qb
        }
        const offset = (page - 1) * rows_per_page
        return qb.limit(rows_per_page + 1).offset(offset)
      })

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
        results,
        search_terms,
        rows_per_page,
        has_next_page,
      }
    },
    async findFirst(trx: TrxOrDb, terms: SearchTerms): Promise<RenderedResult> {
      const result = await this.searchQuery(trx, terms).limit(1)
        .executeTakeFirstOrThrow()
      return formatResult(result)
    },
    async findFirstOptional(
      trx: TrxOrDb,
      terms: SearchTerms,
    ): Promise<null | RenderedResult> {
      const result = await this.searchQuery(trx, terms, (qb) => qb.limit(1))
        .executeTakeFirst()
      return result ? formatResult(result) : null
    },
    async findOne(trx: TrxOrDb, terms: SearchTerms): Promise<RenderedResult> {
      const query = this.searchQuery(trx, terms, (qb) => qb.limit(2))
      const results = await query.execute()
      if (results.length > 1) {
        console.error(asCompiledSql(query))
        throw new Error(
          'Unexpected: more than one result returned. If the query allows for this, but you want the first result, use findFirst instead.',
        )
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
      const query = this.searchQuery(trx, terms, (qb) => qb.limit(2))
      const results = await query.execute()
      if (results.length === 0) return null
      if (results.length > 1) {
        console.error(asCompiledSql(query))
        throw new Error(
          'Unexpected: more than one result returned. If the query allows for this, but you want the first result, use findFirstOptional instead.',
        )
      }
      return formatResult(results[0])
    },
    async getById(
      trx: TrxOrDb,
      id: string | IdSelection,
    ): Promise<RenderedResult> {
      const result = await this.getByIdOptional(trx, id)
      assertOr404(result, `Not found: (${input.top_level_table}.id = '${id}')`)
      return result
    },
    async getByIdOptional(
      trx: TrxOrDb,
      id: string | IdSelection,
    ): Promise<RenderedResult | null> {
      const cache_result = lru?.get(id)
      if (cache_result) return cache_result
      const query = this.buildQuery(trx, {} as SearchTerms, (qb) =>
        qb.where(
          `${top_level_table}.id` as ReferenceExpression<Tables, SelectingFrom>,
          '=',
          id,
        )
          .limit(2))

      const results = await query.execute()
      if (results.length === 0) return null
      if (results.length > 1) {
        console.error(asCompiledSql(query))
        throw new Error('Expected query to return a unique result')
      }
      const db_result = formatResult(results[0])
      lru?.set(id, db_result)
      return db_result
    },
    async updateById(
      trx: TrxOrDb,
      id: string,
      updates: UpdateShape<DB[TopLevelTable]>,
    ) {
      lru?.delete(id)
      const update_query = trx
        // deno-lint-ignore no-explicit-any
        .updateTable(top_level_table as any)
        .set(updates)
        .where('id', '=', id)
      if (!cache_writes) {
        return update_query.execute()
      }
      // When we can cache writes, return the full updated row and cache it
      const result = await update_query
        .returningAll()
        .executeTakeFirstOrThrow()

      lru.set(id, result as unknown as RenderedResult)
    },
    async getByIds(
      trx: TrxOrDb,
      ids: string[] | IdSelection,
    ): Promise<RenderedResult[]> {
      if (Array.isArray(ids)) {
        assert(ids.length > 0)
      }
      const intermediate_results = await this.buildQuery(
        trx,
        {} as SearchTerms,
        (qb) =>
          qb.where(
            `${top_level_table}.id` as ReferenceExpression<
              Tables,
              SelectingFrom
            >,
            'in',
            ids,
          ),
      )
        .execute()
      return intermediate_results.map(formatResult)
    },
    async insertOne(
      trx: TrxOrDb,
      to_insert: InsertShape<DB[TopLevelTable]>,
    ) {
      const insert_query = trx.insertInto(top_level_table).values(
        // deno-lint-ignore no-explicit-any
        to_insert as any,
      )
      if (!cache_writes) {
        const { id } = await insert_query
          .returning('id')
          .executeTakeFirstOrThrow() as unknown as { id: string }
        return id
      }

      const result = await insert_query
        .returningAll()
        .executeTakeFirstOrThrow() as unknown as RenderedResult & { id: string }

      assert(isString(result.id))
      lru.set(result.id, result as unknown as RenderedResult)

      return result.id
    },
    distinctIds(
      trx: TrxOrDb,
      search_terms: SearchTerms,
      ref?: Parameters<
        SelectQueryBuilder<Tables, SelectingFrom, IntermediateResult>['select']
      >[0],
    ): IdSelection {
      return this.searchQuery(
        trx,
        search_terms,
        (qb) =>
          qb.clearSelect()
            // deno-lint-ignore no-explicit-any
            .select(ref || `${top_level_table}.id` as any)
            .distinct() as unknown as SelectQueryBuilder<
              Tables,
              SelectingFrom,
              IntermediateResult
            >,
      ) as unknown as IdSelection
    },
    async countAll(
      trx: TrxOrDb,
      search_terms: SearchTerms,
    ): Promise<number> {
      // Hack, but passing the callback through to .searchQuery enables verbose to work
      const { count } = await this.searchQuery(
        trx,
        search_terms,
        (qb) =>
          qb.clearSelect()
            .select((eb) =>
              eb.fn.countAll().as('count')
            ) as unknown as SelectQueryBuilder<
              Tables,
              SelectingFrom,
              IntermediateResult
            >,
      )
        .executeTakeFirstOrThrow() as unknown as { count: number | string }

      return isString(count) ? parseInt(count) : count
    },
    async removeById(
      trx: TrxOrDb,
      id: string,
    ) {
      lru?.delete(id)
      // deno-lint-ignore no-explicit-any
      await trx.deleteFrom(top_level_table as any)
        .where('id', '=', id)
        .execute()
    },
    getFromCache(id: string) {
      return lru?.get(id)
    },
    setCache(id: string, result: RenderedResult) {
      return lru?.set(id, result)
    },
    invalidateCacheOne(id: string) {
      lru?.delete(id)
    },
    invalidateCacheAll() {
      lru?.clear()
    },
  })
}
