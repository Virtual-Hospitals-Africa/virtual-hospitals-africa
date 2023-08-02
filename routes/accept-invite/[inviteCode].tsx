import { LoggedInHealthWorkerHandler } from '../../types.ts'
import { assert } from 'std/testing/asserts.ts'
import RedirectLogin from '../accept-invite/redirect-login.tsx'

export const handler: LoggedInHealthWorkerHandler = {
  GET(_req, ctx) {
    const inviteCode = ctx.params.inviteCode
    assert(inviteCode)
    ctx.state.session.set('inviteCode', inviteCode)
    return ctx.render()
  },
}

export default function redirectLogin() {
  return <RedirectLogin />
}
