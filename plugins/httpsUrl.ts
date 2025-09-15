/*
  On production the fresh server itself serves HTTP traffic
  and a proxy server handles HTTPS.
  In order to have the ctx.url be the https: address, we overwrite
  it here
*/
import { Plugin } from '$fresh/server.ts'
import { assert } from 'std/assert/assert.ts'

export default function httpsUrlPlugin(): Plugin {
  return {
    name: 'https-url',
    middlewares: [
      {
        path: '/',
        middleware: {
          handler(req, ctx) {
            const proto = req.headers.get('x-forwarded-proto')
            if (proto === 'https' && ctx.url.protocol === 'http:') {
              assert(req.url.startsWith('http://'))
              ctx.url.protocol = 'https:'
            }
            return ctx.next()
          },
        },
      },
    ],
  }
}
