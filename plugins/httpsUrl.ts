/*
  On production the fresh server itself serves HTTP traffic
  and a proxy server handles HTTPS.
  In order to have the ctx.url be the https: address, we overwrite
  it here
*/
import { Context } from 'fresh'
import { assert } from 'std/assert/assert.ts'

export default function httpsUrlPlugin() {
  return {
    name: 'https-url',
    middlewares: [
      {
        path: '/',
        middleware: {
          handler(ctx: Context<unknown>) {
            const proto = ctx.req.headers.get('x-forwarded-proto')
            if (proto === 'https' && ctx.url.protocol === 'http:') {
              assert(ctx.req.url.startsWith('http://'))
              ctx.url.protocol = 'https:'
            }
            return ctx.next()
          },
        },
      },
    ],
  }
}
