import { LoggedInHealthWorkerHandler } from '../../types.ts'
import generateUUID from '../../util/uuid.ts'
import { redis } from '../../external-clients/redis.ts'
import { assert } from 'std/testing/asserts.ts'
import RedirectLogin from '../accept-invite/redirect-login.tsx'

export const sessionId = generateUUID()

export const handler: LoggedInHealthWorkerHandler = {
  async GET(_req, ctx) {
    const inviteCode = ctx.params.inviteCode
    assert(inviteCode)

    await redis.set(sessionId, inviteCode)
    return ctx.render()
  },
}

export default function redirectLogin() {
  return <RedirectLogin />
}
