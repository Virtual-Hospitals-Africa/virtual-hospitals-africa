import type { Generated, InsertObject, ReferenceExpression, SelectQueryBuilder } from 'kysely'
import type { IdSelection, SearchResults, SelectShape, TrxOrDbOrQueryCreator, UpdateShape } from '../../types.ts'
import type { DB, Int8 } from '../../db.d.ts'
import { LRU } from 'tiny-lru'
import { assert } from 'std/assert/assert.ts'
import { assertEquals } from 'std/assert/assert_equals.ts'
import { assertOr404 } from '../../util/assertOr.ts'
import { asCompiledSql, debugLog } from '../helpers.ts'
import isString from '../../util/isString.ts'
import { bindAll } from '../../util/bindAll.ts'

// deno-lint-ignore ban-types
type MaybeOptionalArgs<SearchTerms> = {} extends SearchTerms ? [terms?: SearchTerms] : [terms: SearchTerms]

// deno-lint-ignore no-explicit-any
export type QueryResult<Func extends (...args: any[]) => any> =
  // deno-lint-ignore no-explicit-any
  ReturnType<Func> extends SelectQueryBuilder<any, any, infer Result> ? Result
    : never

type CachingOpts = {
  number_of_items: number
  cache_writes?: boolean
}

export type BaseModelInput<
  SearchTerms extends Partial<Record<string, unknown>>,
  Tables,
  SelectingFrom extends keyof Tables,
  TopLevelTable extends StandardTables,
  IntermediateResult,
  RenderedResult,
> = {
  top_level_table: TopLevelTable
  baseQuery: (
    trx: TrxOrDbOrQueryCreator,
    terms: SearchTerms,
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
  trx: TrxOrDbOrQueryCreator,
  terms?: Record<string, unknown>,
) => SelectQueryBuilder<DB, TableName, SelectShape<DB[TableName]>> {
  const fn = (trx: TrxOrDbOrQueryCreator, _terms?: Record<string, unknown>) =>
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

type StandardTables = {
  [Table in keyof DB]: DB[Table] extends { id: Generated<string> | string | Int8 } ? Table
    : never
}[keyof DB]

class BaseModel<
  Tables,
  TopLevelTable extends StandardTables,
  SelectingFrom extends keyof Tables,
  IntermediateResult,
  SearchTerms extends Partial<Record<string, unknown>>,
  RenderedResult,
> {
  lru: {
    get(id: string | IdSelection): RenderedResult | undefined
    set(id: string | IdSelection, value: RenderedResult): void
    delete(id: string): void
    clear(): void
  }

  constructor(
    public top_level_table: TopLevelTable,
    public baseQuery: (
      trx: TrxOrDbOrQueryCreator,
      terms: SearchTerms,
    ) => SelectQueryBuilder<Tables, SelectingFrom, IntermediateResult>,
    public formatResult: (result: IntermediateResult) => RenderedResult,
    public verbose?: boolean,
    public caching?: CachingOpts,
  ) {
    if (this.cacheWrites()) {
      assert(
        formatResult === identity,
        'In order to cache_writes there can be no transformation of the object returned from the DB',
      )
      assert(
        isSimpleBaseQuery(baseQuery),
        'In order to cache_writes there can be no joins, just returnAll from the DB',
      )
    }

    const _lru: null | LRU = caching ? new LRU<RenderedResult>(caching.number_of_items) : null

    this.lru = {
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
  }

  cacheWrites(): boolean {
    return !!this.caching?.cache_writes
  }
  buildQuery(
    trx: TrxOrDbOrQueryCreator,
    search_terms: SearchTerms & {
      id?: string | string[] | IdSelection
    },
    callback: (
      qb: SelectQueryBuilder<Tables, SelectingFrom, IntermediateResult>,
    ) => SelectQueryBuilder<Tables, SelectingFrom, IntermediateResult>,
  ): SelectQueryBuilder<Tables, SelectingFrom, IntermediateResult> {
    const query = callback(this.baseQuery(trx, search_terms))
    // TODO: log up a level
    if (this.verbose) {
      debugLog(query)
    }
    return query
  }
  searchQuery(
    trx: TrxOrDbOrQueryCreator,
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
      callback,
    )
  }
  async findAll(
    trx: TrxOrDbOrQueryCreator,
    search_terms: SearchTerms,
  ): Promise<RenderedResult[]> {
    const { results } = await this.search(trx, search_terms, {
      rows_per_page: Infinity,
    })
    return results
  }
  async search(
    trx: TrxOrDbOrQueryCreator,
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
      this.formatResult,
    )
    const has_next_page = intermediate_results.length > rows_per_page

    return {
      page,
      results,
      search_terms,
      rows_per_page,
      has_next_page,
    }
  }
  async findFirst(trx: TrxOrDbOrQueryCreator, terms: SearchTerms): Promise<RenderedResult> {
    const result = await this.searchQuery(trx, terms).limit(1)
      .executeTakeFirstOrThrow()
    return this.formatResult(result)
  }
  async findFirstOptional(
    trx: TrxOrDbOrQueryCreator,
    terms: SearchTerms,
  ): Promise<null | RenderedResult> {
    const result = await this.searchQuery(trx, terms, (qb) => qb.limit(1))
      .executeTakeFirst()
    return result ? this.formatResult(result) : null
  }
  async findOne(trx: TrxOrDbOrQueryCreator, terms: SearchTerms): Promise<RenderedResult> {
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
    return this.formatResult(results[0])
  }
  async findOneOptional(
    trx: TrxOrDbOrQueryCreator,
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
    return this.formatResult(results[0])
  }
  async getById(
    trx: TrxOrDbOrQueryCreator,
    id: string | IdSelection,
    ...maybe_search_terms: MaybeOptionalArgs<SearchTerms>
  ): Promise<RenderedResult> {
    const result = await this.getByIdOptional(trx, id, ...maybe_search_terms)
    assertOr404(result, `Not found: (${this.top_level_table}.id = '${id}')`)
    return result
  }
  async getByIdOptional(
    trx: TrxOrDbOrQueryCreator,
    id: string | IdSelection,
    ...maybe_search_terms: MaybeOptionalArgs<SearchTerms>
  ): Promise<RenderedResult | null> {
    const cache_result = this.lru?.get(id)
    if (cache_result) return cache_result
    const query = this.buildQuery(trx, maybe_search_terms[0] || {} as SearchTerms, (qb) =>
      qb.where(
        `${this.top_level_table}.id` as ReferenceExpression<Tables, SelectingFrom>,
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
    const db_result = this.formatResult(results[0])
    this.lru?.set(id, db_result)
    return db_result
  }
  async updateById(
    trx: TrxOrDbOrQueryCreator,
    id: string,
    updates: UpdateShape<DB[TopLevelTable]>,
  ) {
    this.lru?.delete(id)
    const update_query = trx
      // deno-lint-ignore no-explicit-any
      .updateTable(this.top_level_table as any)
      .set(updates)
      .where('id', '=', id)
    if (!this.cacheWrites()) {
      return update_query.execute()
    }
    // When we can cache writes, return the full updated row and cache it
    const result = await update_query
      .returningAll()
      .executeTakeFirstOrThrow()

    this.lru.set(id, result as unknown as RenderedResult)
  }
  async getByIds(
    trx: TrxOrDbOrQueryCreator,
    ids: string[] | IdSelection,
    ...maybe_search_terms: MaybeOptionalArgs<SearchTerms>
  ): Promise<RenderedResult[]> {
    if (Array.isArray(ids)) {
      assert(ids.length > 0)
    }
    const intermediate_results = await this.buildQuery(
      trx,
      maybe_search_terms[0] || {} as SearchTerms,
      (qb) =>
        qb.where(
          `${this.top_level_table}.id` as ReferenceExpression<
            Tables,
            SelectingFrom
          >,
          'in',
          ids,
        ),
    )
      .execute()
    return intermediate_results.map(this.formatResult)
  }
  async insertOne(
    trx: TrxOrDbOrQueryCreator,
    to_insert: InsertObject<DB, TopLevelTable>,
  ) {
    const insert_query = trx.insertInto(this.top_level_table).values(
      // deno-lint-ignore no-explicit-any
      to_insert as any,
    )
    if (!this.cacheWrites()) {
      const { id } = await insert_query
        .returning('id')
        .executeTakeFirstOrThrow() as unknown as { id: string }
      return id
    }

    const result = await insert_query
      .returningAll()
      .executeTakeFirstOrThrow() as unknown as RenderedResult & { id: string }

    assert(isString(result.id))
    this.lru.set(result.id, result as unknown as RenderedResult)

    return result.id
  }
  distinctIds(
    trx: TrxOrDbOrQueryCreator,
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
          .select(ref || `${this.top_level_table}.id` as any)
          .distinct() as unknown as SelectQueryBuilder<
            Tables,
            SelectingFrom,
            IntermediateResult
          >,
    ) as unknown as IdSelection
  }
  async countAll(
    trx: TrxOrDbOrQueryCreator,
    search_terms: SearchTerms,
  ): Promise<number> {
    // Hack, but passing the callback through to .searchQuery enables verbose to work
    const { count } = await this.searchQuery(
      trx,
      search_terms,
      (qb) =>
        qb.clearSelect()
          .select((eb) => eb.fn.countAll().as('count')) as unknown as SelectQueryBuilder<
            Tables,
            SelectingFrom,
            IntermediateResult
          >,
    )
      .executeTakeFirstOrThrow() as unknown as { count: number | string }

    return isString(count) ? parseInt(count) : count
  }
  async removeById(
    trx: TrxOrDbOrQueryCreator,
    id: string,
  ) {
    this.lru.delete(id)
    // deno-lint-ignore no-explicit-any
    await trx.deleteFrom(this.top_level_table as any)
      .where('id', '=', id)
      .execute()
  }
  getFromCache(id: string) {
    return this.lru.get(id)
  }
  setCache(id: string, result: RenderedResult) {
    return this.lru.set(id, result)
  }
  invalidateCacheOne(id: string) {
    this.lru.delete(id)
  }
  invalidateCacheAll() {
    this.lru.clear()
  }
}

export type SearchResult<BM> = BM extends BaseModel<
  // deno-lint-ignore no-explicit-any
  any,
  // deno-lint-ignore no-explicit-any
  any,
  // deno-lint-ignore no-explicit-any
  any,
  // deno-lint-ignore no-explicit-any
  any,
  // deno-lint-ignore no-explicit-any
  any,
  infer RenderedResult
> ? RenderedResult
  : never

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
  & Extra {
  const {
    top_level_table,
    baseQuery,
    formatResult,
    verbose,
    caching,
    ...rest
  } = input

  const model = new BaseModel(
    top_level_table,
    baseQuery,
    formatResult,
    verbose,
    caching,
  )
  return bindAll(Object.assign(model, rest as unknown as Extra))
}

export function crud<TopLevelTable extends StandardTables>(top_level_table: TopLevelTable) {
  return base({
    top_level_table,
    baseQuery: simpleBaseQuery(top_level_table),
    formatResult: identity<SelectShape<DB[TopLevelTable]>>,
  })
}
