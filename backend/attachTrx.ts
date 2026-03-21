import { Context } from 'fresh'

import db from '../db/db.ts'
import { TrxOrDb } from '../types.ts'
import { timeout, TimeoutError } from '../util/timeout.ts'
// import { assert } from 'std/assert/assert.ts'

export type TrxContext = Context<
  {
    trx: TrxOrDb
  }
>

export async function attachTrx(
  ctx: TrxContext,
): Promise<Response> {
  if (ctx.req.method !== 'POST') {
    ctx.state.trx = db
    return ctx.next()
  }

  return await db
    .transaction()
    .setIsolationLevel('read committed')
    .execute(async (trx): Promise<Response>  => {
      ctx.state.trx = trx
      console.log('ATTACH TRX')
      const response = Promise.resolve(ctx.next())
      const timer = timeout<Response>(10000)
      try {
        return await Promise.race([response, timer])
      } catch (err) {
        if (err instanceof TimeoutError) {
          console.error(`TIMEOUT ${ctx.req.method}:${ctx.url.pathname}`)
        }
        throw err
      } finally {
        timer.cancel()
      }
    })
  // return db.connection().execute(async (conn) => {
  //   setApplicationNameAndAttachTrx(ctx, conn)
  // })
}

// Map trx/db objects to their associated context
// const trx_context_map = new WeakMap<TrxOrDb, TrxContext>()

// export function ctxFromTrx(trx: TrxOrDb) {
//   const ctx = trx_context_map.get(trx)
//   assert(ctx, 'trx not found in context map')
//   return ctx
// }

// application_name limited to 63 bytes, so saving some space
// function truncatePath(pathname: string): string {
//   return pathname
//     .replaceAll(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[89ab][0-9a-f]{3}-[0-9a-f]{12}/g, ':id')
//     .replace('/organizations', '/orgs')
//     .replace('/patients', '/ps')
//     .replace('/open_encounter', '/o_e')
// }

// export async function setApplicationNameAndAttachTrx(ctx: TrxContext, trx: TrxOrDb) {
// Tag this connection with application_name for monitoring
// const tag = `${ctx.req.method}:${truncatePath(ctx.url.pathname)}`
// await sql`SET application_name = ${sql.lit(tag)};`.execute(trx)
// trx_context_map.set(trx, ctx)
// }
