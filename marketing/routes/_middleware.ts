import { ZodError } from 'zod'
import { Context } from 'fresh'
import redirect from '../../util/redirect.ts'
import isObjectLike from '../../util/isObjectLike.ts'

// deno-lint-ignore no-explicit-any
async function handleError(ctx: Context<any>) {
  try {
    return await ctx.next()
  } catch (error) {
    console.error(error)
    if (!isObjectLike(error)) {
      return new Response('Unexpected error', { status: 500 })
    }
    if (error.status === 302 && typeof error.location === 'string') {
      return redirect(error.location)
    }
    if (error instanceof ZodError) {
      return new Response(JSON.stringify(error), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }
    const status = Number(error.status) || 500
    const message: string = String(error.message) || 'Internal Server Error'
    return new Response(message, { status })
  }
}

export const handler = [handleError]
