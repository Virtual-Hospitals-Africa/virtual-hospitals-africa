import { assert } from 'std/assert/assert.ts'
import { ZodError } from 'zod'
import redirect from '../util/redirect.ts'
import { Context } from 'fresh'
import isObjectLike from '../util/isObjectLike.ts'
import generateUUID from '../util/uuid.ts'
import { __local_storage__ } from '../backend/local_storage.ts'
import { stripAnsiCode } from 'std/fmt/colors.ts'
import { grokPostgresError } from '../backend/grokPostgresError.ts'
// import { grokPostgresError } from '../backend/grokPostgresError.ts'

function generateTraceparent(): string {
  const trace_id = generateUUID().replace(/-/g, '')
  const span_id = generateUUID().replace(/-/g, '').slice(0, 16)
  return `00-${trace_id}-${span_id}-01`
}

// deno-lint-ignore no-explicit-any
async function attachTraceParent(ctx: Context<any>) {
  const traceparent = generateTraceparent()
  ctx.state.traceparent = traceparent
  console.time(`${ctx.req.method} ${ctx.req.url} ${traceparent} Response`)
  const response = await ctx.next()
  console.timeEnd(`${ctx.req.method} ${ctx.req.url} ${traceparent} Response`)
  response.headers.set('traceparent', traceparent)
  return response
}

function createAsyncContext(ctx: Context<{ traceparent: string }>) {
  return __local_storage__.run({ traceparent: ctx.state.traceparent }, () => ctx.next())
}

// deno-lint-ignore no-explicit-any
async function handleError(ctx: Context<any>) {
  try {
    return await ctx.next()
  } catch (error) {
    console.error(error)
    if (!isObjectLike(error)) {
      console.log(ctx.url.href, typeof error)
      console.error(error)
      return new Response('Unexpected error', { status: 500 })
    }
    if (error.status === 302) {
      assert(error.location, '302 redirect must have a location')
      assert(typeof error.location === 'string', '302 redirect must have a location')
      return redirect(error.location)
    }
    Object.assign(error, {
      url: ctx.url.href,
    })
    if (error instanceof ZodError) {
      console.error(error)
      return new Response(JSON.stringify(error), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }
    const status = Number(error.status) || 500

    if (status === 404) {
      console.error(`Not found ${ctx.url.href}`)
      const is_image_extension = /\.(png|jpe?g|gif|svg|webp|ico|avif)$/i.test(ctx.url.pathname)
      const fetch_dest = ctx.req.headers.get('Sec-Fetch-Dest')
      const is_sub_resource = fetch_dest && fetch_dest !== 'document' && fetch_dest !== 'embed' && fetch_dest !== 'iframe'
      if (is_image_extension && is_sub_resource) {
        return new Response(null, { status: 404 })
      }
      throw error
    }

    const is_expected = error.expected ||
      ctx.url.searchParams.has('expectedTestError')
    if (!is_expected) {
      console.error(error)
    }

    if (ctx.req.method === 'POST' || Deno.env.get('IS_TEST')) {
      const message: string = grokPostgresError(error) || String(error.message) || 'Internal Server Error'
      return new Response(stripAnsiCode(message), { status })
    }

    throw error
  }
}

export const handler = [
  attachTraceParent,
  createAsyncContext,
  handleError,
]
