// plugins/profiler.ts
import { Context } from 'fresh'

export default function profilerPlugin() {
  return {
    name: 'middleware-profiler',
    middlewares: [
      {
        path: '/',
        middleware: {
          handler: async (ctx: Context<unknown>) => {
            const url = new URL(ctx.req.url)
            const route = ctx.route || url.pathname
            const method = ctx.req.method

            // This is the "Global" wrapper entry
            const log = (event: 'START' | 'END') => {
              const timestamp = new Date().toISOString()
              console.log(`${method} ${route} global_middleware ${event} ${timestamp}`)
            }

            log('START')
            const resp = await ctx.next()
            log('END')

            return resp
          },
        },
      },
    ],
  }
}
