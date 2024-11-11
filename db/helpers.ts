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
import * as formatter from 'npm:sql-formatter'
import { DB } from '../db.d.ts'
import { Location, type TrxOrDb } from '../types.ts'
import { assert } from 'std/assert/assert.ts'
import type {
  InsertExpression,
  InsertObject,
} from 'kysely/parser/insert-values-parser.js'

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
 *       first: eb.ref('first_name'),
 *       last: eb.ref('last_name'),
 *       full: sql<string>`first_name || ' ' || last_name`
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
 *   'first', first_name,
 *   'last', last_name,
 *   'full', first_name || ' ' || last_name
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
  // deno-lint-ignore no-explicit-any
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

export function isoDate(
  // deno-lint-ignore no-explicit-any
  ref: ExpressionWrapper<DB, any, Date>,
): RawBuilder<string>

export function isoDate(
  // deno-lint-ignore no-explicit-any
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

// Logs the pretty-printed SQL to the console with parameters interpolated.
export function debugLog(
  qb:
    // deno-lint-ignore no-explicit-any
    | SelectQueryBuilder<any, any, any>
    // deno-lint-ignore no-explicit-any
    | UpdateQueryBuilder<any, any, any, any>
    // deno-lint-ignore no-explicit-any
    | DeleteQueryBuilder<any, any, any>
    // deno-lint-ignore no-explicit-any
    | InsertQueryBuilder<any, any, any>,
) {
  let { sql, parameters } = qb.compile()
  parameters.forEach((p: unknown, i: number) => {
    const sql_index = `$${i + 1}`
    sql = sql.replace(sql_index, debugReplace(p))
  })
  console.log(formatter.format(sql, {
    language: 'postgresql',
  }))
}

export function literalNumber(value: number) {
  assert(Number.isFinite(value), 'Value must be a finite number')
  return sql.lit<number>(value)
}

export function literalString(value: string) {
  assert(typeof value === 'string', 'Value must be a string')
  return sql.lit<string>(value)
}

// deno-lint-ignore no-explicit-any
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
  return sql<string>`TO_CHAR(${
    sql.ref(ref)
  }, 'FMDD FMMonth YYYY FMHH:MI:SS AM')`
}

export function literalLocation(loc: Location) {
  return sql<
    string
  >`ST_SetSRID(ST_MakePoint(${loc.longitude}, ${loc.latitude}), 4326)`
}

export function upsertTrigger(
  tableName: keyof DB,
  columnName: string,
  computation: string,
) {
  const fn_name = `${tableName}_set_${tableName}_${columnName}`.toLowerCase()
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
        BEFORE INSERT OR UPDATE ON "${sql.raw(tableName)}"
        FOR EACH ROW
        EXECUTE FUNCTION ${sql.raw(fn_name)}();
      `.execute(db)
    },
    drop(db: Kysely<DB>) {
      return sql`
        DROP TRIGGER IF EXISTS ${sql.raw(trigger_name)} on "${
        sql.raw(tableName)
      }"
      `.execute(db)
    },
  }
}

export function upsertOne<Table extends keyof DB>(
  trx: TrxOrDb,
  table: Table,
  values: InsertObject<DB, Table>,
) {
  return trx
    .insertInto(table)
    .values(values)
    .onConflict((oc) => oc.doUpdateSet(values as any))
    .returningAll()
    .executeTakeFirstOrThrow()
}
