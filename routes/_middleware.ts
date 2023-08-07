import { redisSession } from 'fresh_session'
import { MiddlewareHandlerContext } from '$fresh/server.ts'
import { WithSession } from 'fresh_session'
import redirect from '../util/redirect.ts'
import { isHealthWorkerWithGoogleTokens } from '../db/models/health_workers.ts'
import { TrxOrDb } from '../types.ts'
import db from '../db/db.ts'
import { redis } from '../external-clients/redis.ts'

export const handler = [
  redisSession(redis, {
    keyPrefix: 'S_',
    maxAge: 10000000,
  }),
  (
    req: Request,
    ctx: MiddlewareHandlerContext<
      WithSession & {
        trx: TrxOrDb
      }
    >,
  ) => {
    const url = new URL(req.url)

    if (!url.pathname.startsWith('/app')) {
      return ctx.next()
    }

    const isAuthedHealthWorker = isHealthWorkerWithGoogleTokens(
      ctx.state.session.data,
    )

    if (!isAuthedHealthWorker) return redirect('/')

    return db.transaction().execute( (trx: TrxOrDb) => {
      ctx.state.trx = trx
      return ctx.next()
    })
  },
]
