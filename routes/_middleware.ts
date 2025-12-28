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
  return ctx.next().catch(function handleError(error: any) {
    if (error.status === 302) {
      assert(error.location, '302 redirect must have a location')
      return redirect(error.location)
    }
    if (error instanceof ZodError) {
      console.error(error)
      return new Response(JSON.stringify(error), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
    const is_expected = error.expected ||
      ctx.url.searchParams.has('expectedTestError')
    if (!is_expected) {
      console.error(error)
    }
    const status = error.status || 500
    const message: string = grokPostgresError(error) || error.message ||
      'Internal Server Error'
    return new Response(message, { status })
  })
}
