import { MiddlewareHandlerContext } from '$fresh/server.ts'
import { WithSession } from 'fresh_session'
import redirect from '../../util/redirect.ts'
import { isHealthWorkerWithGoogleTokens } from '../../db/models/health_workers.ts'
import { TrxOrDb } from '../../types.ts'
import db from '../../db/db.ts'

// Ensure user is a health_worker who has session with google tokens
export const handler = [
  (
    req: Request,
    ctx: MiddlewareHandlerContext<
      WithSession & {
        trx: TrxOrDb
      }
    >,
  ) => {
    if (req.url.endsWith('/app')) {
      return ctx.next()
    }

    const isAuthedHealthWorker = isHealthWorkerWithGoogleTokens(
      ctx.state.session.data,
    )
    if (!isAuthedHealthWorker) return redirect('/')

    return db.transaction().execute((trx: TrxOrDb) => {
      ctx.state.trx = trx
      return ctx.next()
    })
  },
]
