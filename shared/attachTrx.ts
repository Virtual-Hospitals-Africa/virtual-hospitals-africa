import { Context } from 'fresh'
import db from '../db/db.ts'
import { TrxOrDb } from '../types.ts'
import { isWebsocketPath } from '../util/websocket.ts'

export type TrxContext = Context<
  {
    trx: TrxOrDb
  }
>

export function attachTrx(
  ctx: TrxContext,
) {
  // Semi-hacky, just attach the db for websocket routes as we
  // still need a TrxOrDb on the state object for other middleware.
  // rely on business logic to not do anything that would make this an issue
  if (isWebsocketPath(ctx)) {
    ctx.state.trx = db
    return ctx.next()
  }

  // TODO, make a separate read-replica connection for GETs when we ensure GETs are non-mutative, implement this
  // connecting to a read replica
  if (ctx.req.method === 'GET') {
    ctx.state.trx = db
    return ctx.next()
  }

  ctx.state.trx = db
  return ctx.next()
}
