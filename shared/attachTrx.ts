import { FreshContext } from '$fresh/server.ts'
import db from '../db/db.ts'
import { TrxOrDb } from '../types.ts'
import { isWebsocketPath } from '../util/websocket.ts'

export type TrxContext = FreshContext<
  {
    trx: TrxOrDb
  }
>
export function attachTrx(
  // deno-lint-ignore no-unused-vars
  req: Request,
  ctx: TrxContext,
) {
  // Semi-hacky, just attach the db for websocket routes as we
  // still need a TrxOrDb on the state object for other middleware.
  // rely on business logic to not do anything that would make this an issue
  if (isWebsocketPath(ctx)) {
    ctx.state.trx = db
    return ctx.next()
  }

  // TODO, when we ensure GETs are non-mutative, implement this
  // connecting to a read replica
  // if (req.method === 'GET') {
  //   ctx.state.trx = db
  //   return ctx.next()
  // }

  return db
    .transaction()
    .setIsolationLevel('read committed')
    .execute((trx) => {
      ctx.state.trx = trx
      return ctx.next()
    })
}
