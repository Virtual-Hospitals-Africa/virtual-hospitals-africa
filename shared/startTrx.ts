import { FreshContext } from '$fresh/server.ts'
import db from '../db/db.ts'
import { TrxOrDb } from '../types.ts'

export function startTrx(
  _req: Request,
  ctx: FreshContext<
    {
      trx: TrxOrDb
    }
  >,
) {
  return db
    .transaction()
    .setIsolationLevel('read committed')
    .execute((trx) => {
      ctx.state.trx = trx
      return ctx.next()
    })
}
