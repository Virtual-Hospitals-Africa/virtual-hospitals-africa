import { Context } from 'fresh'
import { sql } from 'kysely'
import db from '../db/db.ts'
import { TrxOrDb } from '../types.ts'
import { isWebsocketPath } from '../util/websocket.ts'
import { assert } from 'std/assert/assert.ts'

export type TrxContext = Context<
  {
    trx: TrxOrDb
  }
>

// const proxies = new WeakMap<TrxOrDb, TrxContext>()

// export function ctxFromTrx(trx: TrxOrDb) {
//   const ctx = proxies.get(trx)
//   assert(ctx)
//   return ctx
// }

export function createNewDatabaseProxy(ctx: TrxContext, trx: TrxOrDb) {
  // const proxy = new Proxy(trx, {})
  // proxies.set(proxy, ctx)

  // Tag non-transactional queries with application_name
  // For transactions, this is handled in postHandler.ts with SET LOCAL
  const tag = `${ctx.req.method}:${ctx.url.pathname}`
  // Note: SET commands don't support parameterized queries, use raw SQL
  sql.raw(`SET application_name = '${tag.replace(/'/g, "''")}'`).execute(trx).catch(() => {
    // Ignore errors - this might be a transaction where SET LOCAL is used instead
  })

  return trx
  // return proxy
}

export function attachTrx(
  ctx: TrxContext,
) {
  // Semi-hacky, just attach the db for websocket routes as we
  // still need a TrxOrDb on the state object for other middleware.
  // rely on business logic to not do anything that would make this an issue
  if (isWebsocketPath(ctx)) {
    ctx.state.trx = createNewDatabaseProxy(ctx, db)
    return ctx.next()
  }

  // TODO, make a separate read-replica connection for GETs when we ensure GETs are non-mutative, implement this
  // connecting to a read replica
  if (ctx.req.method === 'GET') {
    ctx.state.trx = createNewDatabaseProxy(ctx, db)
    return ctx.next()
  }

  ctx.state.trx = createNewDatabaseProxy(ctx, db)
  return ctx.next()
}
