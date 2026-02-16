// deno-lint-ignore-file no-explicit-any
// Taken from https://github.com/kysely-org/kysely/blob/master/src/helpers/postgres.ts
import {
  DeleteQueryBuilder,
  Expression,
  ExpressionBuilder,
  expressionBuilder,
  ExpressionWrapper,
  ExtractTypeFromReferenceExpression,
  InsertQueryBuilder,
  Kysely,
  RawBuilder,
  SelectQueryBuilder,
  Simplify,
  sql,
  StringReference,
  UpdateQueryBuilder,
} from 'kysely'
import * as formatter from 'sql-formatter'
import type { DB } from '../db.d.ts'
import type { Coordinates, IdSelection, InsertRows, NonEmptyArray, TrxOrDb, TrxOrDbOrQueryCreator } from '../types.ts'
import { assert } from 'std/assert/assert.ts'
import type { InsertObject, QueryCreator } from 'kysely'
import { isUUID } from '../util/uuid.ts'
import entries from '../util/entries.ts'

import { chunk } from '../util/chunk.ts'
import isString from '../util/isString.ts'

/**
 * A postgres helper for aggregating a subquery (or other expression) into a JSONB array.
 *
 * ### Examples
 *
 * <!-- siteExample("select", "Nested array", 110) -->
 *
 * While kysely is not an ORM and it doesn't have the concept of relations, we do provide
 * helpers for fetching nested objects and arrays in a single query. In this example we
 * use the `jsonArrayFrom` helper to fetch person's pets along with the person's id.
 *
 * Please keep in mind that the helpers under the `kysely/helpers` folder, including
 * `jsonArrayFrom`, are not guaranteed to work with third party dialects. In order for
 * them to work, the dialect must automatically parse the `json` data type into
 * javascript JSON values like objects and arrays. Some dialects might simply return
 * the data as a JSON string. In these cases you can use the built in `ParseJSONResultsPlugin`
 * to parse the results.
 *
 * ```ts
 * import { jsonArrayFrom } from 'kysely/helpers/postgres'
 *
 * const result = await db
 *   .selectFrom('person')
 *   .select((eb) => [
 *     'id',
 *     jsonArrayFrom(
 *       eb.selectFrom('pet')
 *         .select(['pet.id as pet_id', 'pet.name'])
 *         .whereRef('pet.owner_id', '=', 'person.id')
 *         .orderBy('pet.name')
 *     ).as('pets')
 *   ])
 *   .execute()
 * ```
 *
 * The generated SQL (PostgreSQL):
 *
 * ```sql
 * select "id", (
 *   select coalesce(json_agg(agg), '[]') from (
 *     select "pet"."id" as "pet_id", "pet"."name"
 *     from "pet"
 *     where "pet"."owner_id" = "person"."id"
 *     order by "pet"."name"
 *   ) as agg
 * ) as "pets"
 * from "person"
 * ```
 */
export function jsonArrayFrom<O>(
  expr: Expression<O>,
): RawBuilder<Simplify<O>[]> {
  return sql`(select coalesce(json_agg(agg), '[]') from ${expr} as agg)`
}

// Like the above, but extracts a given column from the subquery.
export function jsonArrayFromColumn<
  O extends Record<string, unknown>,
  K extends keyof O,
>(
  column: K,
  expr: Expression<O>,
): RawBuilder<Simplify<O[K]>[]> {
  const col_ref = expressionBuilder().ref(column as never)
  return sql`(select coalesce(json_agg(${col_ref}), '[]') from ${expr} as agg)`
}

export function jsonAgg<O>(
  expr: Expression<O>,
): RawBuilder<Simplify<O>[]> {
  return sql`json_agg(${expr})`
}

export function arrayAggIds(
  expr: Expression<string | IdSelection>,
): RawBuilder<string[]>

export function arrayAggIds(
  expr: SelectQueryBuilder<any, any, { id: string | IdSelection }>,
): RawBuilder<string[]>

export function arrayAggIds(
  expr: Expression<string | IdSelection> | SelectQueryBuilder<any, any, { id: string | IdSelection }>,
): RawBuilder<string[]> {
  // If it's a SelectQueryBuilder (has a 'compile' method), wrap it in a subquery
  if ('compile' in expr && typeof expr.compile === 'function') {
    return sql<string[]>`(SELECT array_agg(id) FROM ${expr} as agg)`
  }
  // Otherwise treat it as a simple expression
  return sql<string[]>`array_agg(${expr})`
}

export function arrayFromSubquery<O>(
  expr: SelectQueryBuilder<any, any, { id: O }>,
): RawBuilder<O[]> {
  return sql<O[]>`ARRAY(${expr})`
}

export function literalUUIDArray(ids: string[]): RawBuilder<string[]> {
  return sql<string[]>`ARRAY[${sql.join(ids.map((id) => sql.lit(id)), sql`, `)}]::uuid[]`
}

/**
 * A postgres helper for turning a subquery (or other expression) into a JSON object.
 *
 * The subquery must only return one row.
 *
 * ### Examples
 *
 * <!-- siteExample("select", "Nested object", 120) -->
 *
 * While kysely is not an ORM and it doesn't have the concept of relations, we do provide
 * helpers for fetching nested objects and arrays in a single query. In this example we
 * use the `jsonObjectFrom` helper to fetch person's favorite pet along with the person's id.
 *
 * Please keep in mind that the helpers under the `kysely/helpers` folder, including
 * `jsonObjectFrom`, are not guaranteed to work with 3rd party dialects. In order for
 * them to work, the dialect must automatically parse the `json` data type into
 * javascript JSON values like objects and arrays. Some dialects might simply return
 * the data as a JSON string. In these cases you can use the built in `ParseJSONResultsPlugin`
 * to parse the results.
 *
 * ```ts
 * import { jsonObjectFrom } from 'kysely/helpers/postgres'
import { assert } from 'std/assert/assert.ts';
 *
 * const result = await db
 *   .selectFrom('person')
 *   .select((eb) => [
 *     'id',
 *     jsonObjectFrom(
 *       eb.selectFrom('pet')
 *         .select(['pet.id as pet_id', 'pet.name'])
 *         .whereRef('pet.owner_id', '=', 'person.id')
 *         .where('pet.is_favorite', '=', true)
 *     ).as('favorite_pet')
 *   ])
 *   .execute()
 * ```
 *
 * The generated SQL (PostgreSQL):
 *
 * ```sql
 * select "id", (
 *   select to_json(obj) from (
 *     select "pet"."id" as "pet_id", "pet"."name"
 *     from "pet"
 *     where "pet"."owner_id" = "person"."id"
 *     and "pet"."is_favorite" = $1
 *   ) as obj
 * ) as "favorite_pet"
 * from "person"
 * ```
 */
export function jsonObjectFrom<O>(
  expr: Expression<O>,
): RawBuilder<Simplify<O> | null> {
  return sql`(select to_json(obj) from ${expr} as obj)`
}

/**
 * The PostgreSQL `json_build_object` function.
 *
 * NOTE: This helper is only guaranteed to fully work with the built-in `PostgresDialect`.
 * While the produced SQL is compatible with all PostgreSQL databases, some 3rd party dialects
 * may not parse the nested JSON into objects. In these cases you can use the built in
 * `ParseJSONResultsPlugin` to parse the results.
 *
 * ### Examples
 *
 * ```ts
 * const result = await db
 *   .selectFrom('person')
 *   .select((eb) => [
 *     'id',
 *     jsonBuildObject({
 *       first: eb.ref('first_names'),
 *       last: eb.ref('surname'),
 *       full: sql<string>`first_names || ' ' || surname`
 *     }).as('name')
 *   ])
 *   .execute()
 *
 * result[0].id
 * result[0].name.first
 * result[0].name.last
 * result[0].name.full
 * ```
 *
 * The generated SQL (PostgreSQL):
 *
 * ```sql
 * select "id", json_build_object(
 *   'first', first_names,
 *   'last', surname,
 *   'full', first_names || ' ' || surname
 * ) as "name"
 * from "person"
 * ```
 */
export function jsonBuildObject<O extends Record<string, Expression<unknown>>>(
  obj: O,
): RawBuilder<
  Simplify<
    {
      [K in keyof O]: O[K] extends Expression<infer V> ? V : never
    }
  >
> {
  return sql`json_build_object(${
    sql.join(
      Object.keys(obj).flatMap((k) => [sql.lit(k), obj[k]]),
    )
  })`
}

export function jsonBuildNullableObject<
  O extends Record<string, Expression<unknown>>,
>(
  ew: ExpressionWrapper<any, any, any>,
  obj: O,
): RawBuilder<
  | null
  | Simplify<
    {
      [K in keyof O]: O[K] extends Expression<infer V> ? V : never
    }
  >
> {
  return sql`
    CASE WHEN ${ew} IS NULL
      THEN NULL
      ELSE ${jsonBuildObject(obj)}
    END
  `
}

export function toJSON<
  Tables extends keyof DB,
  Ref extends StringReference<DB, Tables>,
>(eb: ExpressionBuilder<DB, Tables>, ref: Ref) {
  return eb.fn<ExtractTypeFromReferenceExpression<DB, Tables, Ref>>('TO_JSON', [
    ref,
  ]).as(ref)
}

export const now = sql<Date>`now()`

export const today_in_johannesburg = sql<
  Date
>`(now() AT TIME ZONE 'Africa/Johannesburg')::date`

export const tomorrow_in_johannesburg = sql<
  Date
>`(now() AT TIME ZONE 'Africa/Johannesburg' + interval '1 day')::date`

export function isoDate(
  ref: ExpressionWrapper<DB, any, Date>,
): RawBuilder<string>

export function isoDate(
  ref: ExpressionWrapper<DB, any, Date | null>,
): RawBuilder<string | null>

export function isoDate(ref: unknown): unknown {
  return sql<string>`TO_CHAR(${ref}, 'YYYY-MM-DD')`
}

// TODO: see if kysely has built-in support for this.
// I bet we're not handling arrays properly
function debugReplace(parameter: unknown) {
  if (parameter === null) return 'null'
  switch (typeof parameter) {
    case 'string':
      return "'" + parameter.replaceAll("'", "''") + "'"
    case 'number':
      return `${parameter}`
    case 'boolean':
      return `${parameter}`
    case 'object':
      return "'" + JSON.stringify(parameter) + "'"
    default:
      throw new Error('Unsupported parameter type: ' + typeof parameter)
  }
}

export function debugReplaceAll(
  sql: string,
  parameters: readonly unknown[],
) {
  parameters.forEach((p: unknown, i: number) => {
    const sql_index = `$${i + 1}`
    sql = sql.replace(sql_index, debugReplace(p))
  })
  // return sql
  return formatter.format(sql, {
    language: 'postgresql',
  })
}

export function asCompiledSql(
  qb:
    | SelectQueryBuilder<any, any, any>
    | UpdateQueryBuilder<any, any, any, any>
    | DeleteQueryBuilder<any, any, any>
    | InsertQueryBuilder<any, any, any>,
) {
  const { sql, parameters } = qb.compile()
  return debugReplaceAll(sql, parameters)
}

// Logs the pretty-printed SQL to the console with parameters interpolated.
export function debugLog(
  qb:
    | SelectQueryBuilder<any, any, any>
    | UpdateQueryBuilder<any, any, any, any>
    | DeleteQueryBuilder<any, any, any>
    | InsertQueryBuilder<any, any, any>,
) {
  console.log(
    asCompiledSql(qb),
  )
}

export function literalNumber(value: number) {
  assert(
    Number.isFinite(value),
    `Value for must be a finite number. Got ${value}`,
  )
  return sql.lit<number>(value)
}

export function literalString<Value extends string>(value: Value) {
  assert(typeof value === 'string', 'Value must be a string')
  return sql.lit<Value>(value)
}

export function literalUUID(value: string) {
  assert(typeof value === 'string', 'Value must be a string')
  assert(isUUID(value))
  return sql.raw(`'${value}'::uuid`)
}

export function literalOptionalDate(value?: string | null): RawBuilder<any> {
  if (value == null) return sql.raw('null')
  assert(
    /^\d{4}-\d{2}-\d{2}$/.test(value),
    'Value must be a date string or null',
  )
  return sql.raw(`'${value}'::date`)
}

export function literalBoolean(value: boolean): RawBuilder<boolean> {
  assert(typeof value === 'boolean', 'Value must be a boolean')
  return sql.lit(value)
}

export function longFormattedDate(ref: string) {
  return sql<string | null>`TO_CHAR(${sql.ref(ref)}, 'FMDD FMMonth YYYY')`
}

export function longFormattedDateTime(ref: string) {
  return sql<string>`TO_CHAR(${sql.ref(ref)}, 'FMDD FMMonth YYYY FMHH:MI:SS AM')`
}

export function literalLocation(loc: Coordinates) {
  return sql<
    string
  >`ST_SetSRID(ST_MakePoint(${loc.longitude}, ${loc.latitude}), 4326)`
}

export function trigger(
  table: keyof DB,
  fn_name: string,
  computation: string,
  when: 'BEFORE' | 'AFTER',
) {
  const fn_full_name = `${table}_${fn_name}`.toLowerCase()
  const trigger_name = `${fn_full_name}_trigger`

  return {
    up(db: Kysely<DB>) {
      return sql`
        CREATE OR REPLACE FUNCTION ${sql.raw(fn_full_name)}()
        RETURNS TRIGGER AS $$
        BEGIN
            ${sql.raw(computation)};
        END;
        $$ LANGUAGE plpgsql;

        CREATE OR REPLACE TRIGGER ${sql.raw(fn_full_name)}_trigger
        ${sql.raw(when)} INSERT OR UPDATE ON "${sql.raw(table)}"
        FOR EACH ROW
        EXECUTE FUNCTION ${sql.raw(fn_full_name)}();
      `.execute(db)
    },
    down(db: Kysely<DB>) {
      return sql`
        DROP TRIGGER IF EXISTS ${sql.raw(trigger_name)} on "${sql.raw(table)}"
      `.execute(db)
    },
  }
}

export function upsertTrigger(
  table: keyof DB,
  columnName: string,
  computation: string,
) {
  const fn_name = `${table}_set_${table}_${columnName}`.toLowerCase()
  const trigger_name = `${fn_name}_trigger`

  return {
    create(db: Kysely<DB>) {
      return sql`
        CREATE OR REPLACE FUNCTION ${sql.raw(fn_name)}()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW."${sql.raw(columnName)}" := ${sql.raw(computation)};
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE OR REPLACE TRIGGER ${sql.raw(fn_name)}_trigger
        BEFORE INSERT OR UPDATE ON "${sql.raw(table)}"
        FOR EACH ROW
        EXECUTE FUNCTION ${sql.raw(fn_name)}();
      `.execute(db)
    },
    drop(db: Kysely<DB>) {
      return sql`
        DROP TRIGGER IF EXISTS ${sql.raw(trigger_name)} on "${sql.raw(table)}"
      `.execute(db)
    },
  }
}

export function upsertOne<Table extends keyof DB>(
  trx: TrxOrDbOrQueryCreator,
  table: Table,
  values: InsertObject<DB, Table>,
) {
  return trx
    .insertInto(table)
    .values(values)
    .onConflict((oc) => oc.column('id' as any).doUpdateSet(values as any))
    .returningAll()
    .executeTakeFirstOrThrow()
}

export function blankSelection(
  qb: QueryCreator<any>,
) {
  return qb.selectNoFrom(sql<0>`0`.as('blank'))
}

export const success_true = sql<true>`true`.as('success')

export function successSelection(
  qb: QueryCreator<any>,
) {
  return qb.selectNoFrom(success_true)
}

export async function ensureAllEnumValuesExist(
  trx: TrxOrDb,
  enum_name: string,
  values: string[],
) {
  // Build multiple ALTER TYPE statements and execute them together
  const statements = values.map((value) => `ALTER TYPE ${enum_name} ADD VALUE IF NOT EXISTS '${value}'`).join('; ')

  await sql.raw(statements).execute(trx)
}

export function assertOnInsert({
  table,
  function_name,
  assertion,
  error_message,
  after,
}: {
  table: keyof DB
  function_name: string
  assertion: string
  error_message: string
  after?: boolean
}) {
  const trigger_name = `${function_name}_trigger`

  return {
    async up(db: Kysely<DB>) {
      await sql`
        CREATE OR REPLACE FUNCTION ${sql.raw(function_name)}()
        RETURNS TRIGGER AS $$
        BEGIN
          ASSERT ${sql.raw(assertion)}, ${sql.raw(error_message)};
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql
      `.execute(db)
      await sql`
        CREATE TRIGGER ${sql.raw(trigger_name)}
        ${sql.raw(after ? 'AFTER' : 'BEFORE')} INSERT OR UPDATE ON ${sql.raw(table)}
        FOR EACH ROW
        EXECUTE FUNCTION ${sql.raw(function_name)}();
      `.execute(db)
    },
    async down(db: Kysely<DB>) {
      await sql`DROP TRIGGER IF EXISTS ${sql.raw(trigger_name)} ON ${sql.raw(table)}`.execute(db)
      await sql`DROP FUNCTION IF EXISTS ${sql.raw(function_name)}()`.execute(db)
    },
  }
}

export function temporaryTable<T extends Record<string, unknown>>(
  trx: TrxOrDb,
  records: T[],
) {
  return records.map((record) =>
    trx.selectNoFrom(() =>
      entries(record).map(([key, value]) =>
        typeof value === 'string' && isUUID(value) ? sql.raw(`'${value}'::uuid`).as(key as string) : sql.lit(value).as(key as string)
      )
    )
  ).reduce((acc, curr) => acc.unionAll(curr)) as unknown as SelectQueryBuilder<
    DB,
    never,
    T
  >
}

export function concat(
  ...args: (string | ExpressionWrapper<any, any, any>)[]
): RawBuilder<string> {
  return sql<string>`concat(${sql.join(args.map((arg) => isString(arg) ? sql.lit(arg) : arg))})`
}

export function asText<EB extends ExpressionBuilder<DB, any>>(
  eb: EB,
  ref: Parameters<EB['ref']>[0],
) {
  return sql<string>`${eb.ref(ref)}::text`
}

export function asTextArray<EB extends ExpressionBuilder<DB, any>>(
  eb: EB,
  ref: Parameters<EB['ref']>[0],
) {
  return sql<string[]>`${eb.ref(ref)}::text[]`
}

export function orderByArrayPosition<
  EB extends ExpressionBuilder<any, any>,
  Ref extends Parameters<EB['ref']>[0],
>(
  eb: EB,
  ref: Ref,
  [first, ...rest]: EB extends ExpressionBuilder<infer SDB, any> ? NonEmptyArray<
      ExtractTypeFromReferenceExpression<SDB, any, Ref>
    >
    : never,
) {
  const case_statement = eb.case().when(ref, '=', first).then(rest.length + 1)
  return rest.reduce(
    (statement, option, i) => statement.when(ref, '=', option).then(rest.length - i),
    case_statement,
  ).else(0).end()
}

export function caseWhenMatching<T>(
  eb: ExpressionBuilder<any, any>,
  ew: ExpressionWrapper<any, any, string>,
  record: Record<string, T>,
) {
  const [[first_key, first_value], ...rest] = entries(record)
  const case_statement = eb.case().when(ew, '=', first_key).then(first_value)
  return rest.reduce(
    (statement, [key, value]) => statement.when(ew, '=', key).then(value),
    case_statement,
  ).end()
}

export function deduplicate<T extends Array<any>, U>(
  func: (trx: TrxOrDbOrQueryCreator, ...parameters: T) => Promise<U>,
): (trx: TrxOrDbOrQueryCreator, ...parameters: T) => Promise<U> {
  let pending: Map<string, Promise<U>> | null = null

  return (trx: TrxOrDbOrQueryCreator, ...parameters: T): Promise<U> => {
    // Validate parameters are JSON-serializable
    let key: string
    try {
      key = JSON.stringify(parameters)
    } catch {
      throw new Error('Parameters must be JSON-serializable')
    }

    // Initialize pending map for this tick if needed
    if (pending === null) {
      pending = new Map()
      // Clear the map on the next tick
      queueMicrotask(() => {
        pending = null
      })
    }

    // Return existing promise if we already have one for these parameters
    const existing = pending.get(key)
    if (existing) {
      return existing
    }

    // Create and cache the promise
    const promise = func(trx, ...parameters)
    pending.set(key, promise)
    return promise
  }
}

export function looksLikeSExpression(column_name: string) {
  return sql`left(${column_name}, 1) = '(' AND right(${column_name}, 1) = ')'`
}

export async function insertChunks<Table extends keyof DB>(trx: TrxOrDb, table: Table, rows: InsertRows<Table>) {
  for (const batch of chunk(rows, 1000)) {
    await trx.insertInto(table).values(batch).execute()
  }
}
