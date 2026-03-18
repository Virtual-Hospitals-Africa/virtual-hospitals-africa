import { Context } from 'fresh'
import { assert } from 'std/assert/assert.ts'

// export function timeMiddleware<Ctx extends Context<any>>(middleware: (ctx: Ctx) => Response | Promise<Response>) {
//   assert(middleware.name, 'Must supply named function')
//   return async (ctx: Ctx) => {
//     assert(ctx.state.traceparent)
//     console.time(`Middleware ${middleware.name} ${ctx.state.traceparent}`)
//     const response = await ctx.next()
//     console.timeEnd(`Middleware ${middleware.name} ${ctx.state.traceparent}`)
//     return response
//   }
// }

// deno-lint-ignore no-explicit-any
export function timeMiddlewareCallNext<Ctx extends Context<any>>(middleware: (ctx: Ctx) => void | Response | Promise<void | Response>) {
  assert(middleware.name, 'Must supply named function')
  return async (ctx: Ctx): Promise<Response> => {
    assert(ctx.state.traceparent)
    console.time(`Middleware ${middleware.name} ${ctx.state.traceparent}`)
    const maybe_response = await middleware(ctx)
    console.timeEnd(`Middleware ${middleware.name} ${ctx.state.traceparent}`)
    return maybe_response || ctx.next()
  }
}
