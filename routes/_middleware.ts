import { FreshContext } from '$fresh/server.ts'
import { assert } from 'std/assert/assert.ts'
import redirect from '../util/redirect.ts'
import { ZodError } from 'npm:zod'

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

export function grokPostgresError(err: Error) {
  // deno-lint-ignore no-explicit-any
  const cause: any = err.cause || err
  if (!('fields' in cause)) return
  return `${cause.name}: ${cause.fields.message}`
}

export const handler = (_req: Request, ctx: FreshContext) =>
  // deno-lint-ignore no-explicit-any
  ctx.next().catch(function handleError(err: any) {
    if (err.status === 302) {
      assert(err.location, '302 redirect must have a location')
      return redirect(err.location)
    }
    // Don't gum up the logs for tests which expect an error
    if (!ctx.url.searchParams.has('expectedTestError')) {
      console.error(err)
      logError(err)
    }
    if (err instanceof ZodError) {
      return new Response(JSON.stringify(err), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
    const status = err.status || 500
    const message: string = grokPostgresError(err) || err.message ||
      'Internal Server Error'
    return new Response(message, { status })
  })
