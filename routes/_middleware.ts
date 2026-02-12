import { assert } from 'std/assert/assert.ts'
import { ZodError } from 'zod'
import redirect from '../util/redirect.ts'
import { Context } from 'fresh'
import isObjectLike from '../util/isObjectLike.ts'
import { stripAnsiCode } from 'std/fmt/colors.ts'

export function grokPostgresError(err: Record<string, unknown>) {
  // deno-lint-ignore no-explicit-any
  const cause: any = err.cause || err
  if (!('fields' in cause)) return
  return `${cause.name}: ${cause.fields.message}`
}

export const handler = async (ctx: Context<unknown>) => {
  try {
    console.time(`${ctx.req.method} ${ctx.req.url} Response`)
    const response = await ctx.next()
    console.timeEnd(`${ctx.req.method} ${ctx.req.url} Response`)
    return response
  } catch (error) {
    if (!isObjectLike(error)) {
      console.error(error)
      return new Response('Unexpected error', { status: 500 })
    }
    if (error.status === 302) {
      assert(error.location, '302 redirect must have a location')
      assert(typeof error.location === 'string', '302 redirect must have a location')
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
    const status = Number(error.status) || 500
    const message: string = grokPostgresError(error) || String(error.message) ||
      'Internal Server Error'
    return new Response(stripAnsiCode(message), { status })
  }
}
