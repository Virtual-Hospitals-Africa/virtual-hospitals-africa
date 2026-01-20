import { Context } from 'fresh'
import { sql } from 'kysely'
import db from '../db/db.ts'
import { TrxOrDb } from '../types.ts'
import { assert } from 'std/assert/assert.ts'

export type TrxContext = Context<
  {
    trx: TrxOrDb
  }
>

// Map trx/db objects to their associated context
const trxContextMap = new WeakMap<TrxOrDb, TrxContext>()

export function ctxFromTrx(trx: TrxOrDb) {
  const ctx = trxContextMap.get(trx)
  assert(ctx, 'trx not found in context map')
  return ctx
}

export function setApplicationName(ctx: TrxContext, trx: TrxOrDb) {
  // Store the context association for later lookup
  trxContextMap.set(trx, ctx)

  // For non-transactional queries on the pool, we CAN'T safely set application_name
  // because it would affect whichever connection from the pool executes the SET,
  // creating race conditions where queries get tagged with the wrong route.
  //
  // For transactions, application_name is set via SET LOCAL in postHandler.ts
  // which is transaction-scoped and safe.

  return trx
}

export function attachTrx(
  ctx: TrxContext,
) {
  // Use db.connection() to get a dedicated connection from the pool
  // This allows us to set application_name per-request without race conditions
  return db.connection().execute(async (conn) => {
    // Tag this connection with application_name for monitoring
    
    // application_name limited to 63 bytes, so saving some space
    const tag = `${ctx.req.method}:${ctx.url.pathname}`
      .replaceAll(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/g, ':id')
      .replace('/organizations', '/orgs')
      .replace('/patients', '/ps')
      .replace('/open_encounter', '/o_e')

    await sql.raw(`SET application_name = '${tag.replace(/'/g, "''")}'`).execute(conn)

    // Store the connection in the WeakMap for ctxFromTrx lookups
    ctx.state.trx = setApplicationName(ctx, conn)

    return await ctx.next()
  })
}
