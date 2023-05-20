import { Handlers } from '$fresh/server.ts'
import { WithSession } from 'fresh_session'

export const handler: Handlers<Record<string, never>, WithSession> = {
  GET(req, ctx) {
    if (ctx.state.session) {
      ctx.state.session.destroy()
    }
    return new Response('Logged out', {
      status: 200,
    })
  },
}
