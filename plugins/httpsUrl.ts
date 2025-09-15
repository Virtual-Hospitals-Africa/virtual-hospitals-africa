import { Plugin } from '$fresh/server.ts'

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
              ctx.url.protocol = 'https:'
            }
            return ctx.next()
          },
        },
      },
    ],
  }
}
