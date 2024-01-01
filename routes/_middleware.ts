import { redisSession } from 'fresh_session'
import { MiddlewareHandlerContext } from '$fresh/server.ts'
import { WithSession } from 'fresh_session'
import redirect from '../util/redirect.ts'
import { TrxOrDb } from '../types.ts'
import db from '../db/db.ts'
import { redis } from '../external-clients/redis.ts'

const error_log = 'test_error.log'
const logError = (err: Error) => {
  const log = `${new Date().toISOString()}\n${
    err.stack || err.message || err
  }\n\n`
  Deno.writeTextFileSync(error_log, log, { append: true })
}

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

    const accessingApp = url.pathname.startsWith('/app')

    if (!accessingApp) {
      return ctx.next()
    }

    if (!ctx.state.session.get('health_worker_id')) return redirect('/')

    return db.transaction().execute((trx) => {
      ctx.state.trx = trx
      return ctx.next()
    }).catch((err) => {
      console.error(err)
      logError(err)
      const status = err.status || 500
      const message: string = err.message || 'Internal Server Error'
      return new Response(message, { status })
    })
  },
]
