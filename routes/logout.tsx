import { Handlers } from '$fresh/server.ts'
import { WithSession } from 'fresh_session'
import redirect from '../util/redirect.ts'

export const handler: Handlers<Record<string, never>, WithSession> = {
  GET(_req, ctx) {
    if (ctx.state.session) {
      ctx.state.session.destroy()
    }
    return redirect('/')
  },
}
