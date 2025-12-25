import { Context } from 'fresh'
import db from '../db/db.ts'
import { TrxOrDb } from '../types.ts'
import { isWebsocketPath } from '../util/websocket.ts'

export type TrxContext = Context<
  {
    trx: TrxOrDb
  }
>
export async function attachTrx(
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

  const response = await db
    .transaction()
    .setIsolationLevel('read committed')
    .execute((trx) => {
      ctx.state.trx = trx
      return ctx.next()
    })

  console.log('xresponse')

  return response
}
