import { FreshContext } from '$fresh/server.ts'
import db from '../db/db.ts'
import { TrxOrDb } from '../types.ts'

export type TrxContext = FreshContext<
  {
    trx: TrxOrDb
  }
>

export function startTrx(
  _req: Request,
  ctx: TrxContext,
) {
  return db
    .transaction()
    .setIsolationLevel('read committed')
    .execute((trx) => {
      ctx.state.trx = trx
      return ctx.next()
    })
}
