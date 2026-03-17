import { assert } from 'std/assert/assert.ts'
import { ZodError } from 'zod'
import redirect from '../util/redirect.ts'
import { Context } from 'fresh'
import isObjectLike from '../util/isObjectLike.ts'
import { stripAnsiCode } from 'std/fmt/colors.ts'
import generateUUID from '../util/uuid.ts'
import { AsyncLocalStorage } from 'node:async_hooks';

const __local_storage__ = new AsyncLocalStorage()

Object.assign(Deno, { __local_storage__ })

export function grokPostgresError(err: Record<string, unknown>) {
  // deno-lint-ignore no-explicit-any
  const cause: any = err.cause || err
  if (!('fields' in cause)) return
  return `${cause.name}: ${cause.fields.message}`
}

function createAsyncContext(ctx: Context<unknown>) {
  return __local_storage__.run({ foo: 'bar' }, () => ctx.next())
}

async function handleError(ctx: Context<unknown>) {
  try {
    const traceparent = generateUUID()
    console.time(`${ctx.req.method} ${ctx.req.url} ${traceparent} Response`)
    const response = await ctx.next()
    console.timeEnd(`${ctx.req.method} ${ctx.req.url} ${traceparent} Response`)
    return response
  } catch (error) {
    if (!isObjectLike(error)) {
      console.log(typeof error)
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

export const handler = [
  createAsyncContext,
  handleError
]
