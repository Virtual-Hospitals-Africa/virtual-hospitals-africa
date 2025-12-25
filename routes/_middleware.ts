import { assert } from 'std/assert/assert.ts'
import { ZodError } from 'zod'
import redirect from '../util/redirect.ts'
import { Context } from 'fresh'

export function grokPostgresError(err: Error) {
  // deno-lint-ignore no-explicit-any
  const cause: any = err.cause || err
  if (!('fields' in cause)) return
  return `${cause.name}: ${cause.fields.message}`
}

export const handler = (ctx: Context<unknown>) => { // deno-lint-ignore no-explicit-any
  return ctx.next().catch(function handleError(err: any) {
    if (err.status === 302) {
      assert(err.location, '302 redirect must have a location')
      return redirect(err.location)
    }
    // Don't gum up the logs for tests which expect an error
    if (!ctx.url.searchParams.has('expectedTestError')) {
      console.error(err)
    }
    if (err instanceof ZodError) {
      // console.error(err)
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
}
