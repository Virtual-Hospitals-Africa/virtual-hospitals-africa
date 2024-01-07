import { redisSession } from 'fresh_session'
import { FreshContext } from '$fresh/server.ts'
import { WithSession } from 'fresh_session'
import redirect from '../util/redirect.ts'
import { TrxOrDb } from '../types.ts'
import db from '../db/db.ts'
import { redis } from '../external-clients/redis.ts'

// TODO: only do this on dev & test?
const log_file = Deno.env.get('LOG_FILE') || 'server.log'
export const log = (msg: string) => {
  const log = `${new Date().toISOString()}\n${msg}\n\n`
  return Deno.writeTextFile(log_file, log, { append: true })
}

export const logError = (err: Error) => {
  // deno-lint-ignore no-explicit-any
  return log((err.stack || err.message || err) as any)
}

export const handler = [
  redisSession(redis, {
    keyPrefix: 'S_',
    maxAge: 10000000,
  }),
  (
    req: Request,
    ctx: FreshContext<
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
