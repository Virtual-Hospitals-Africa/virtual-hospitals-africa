import { deleteCookie } from 'std/http/cookie.ts'
import redirect from '../../util/redirect.ts'
import * as sessions from '../../db/models/sessions.ts'
import * as cookie from '../../shared/cookie.ts'
import { LoggedInHealthWorkerHandler } from '../../types.ts'
import { assert } from 'std/assert/assert.ts'
import { assertOr404 } from '../../util/assertOr.ts'
import db from '../../db/db.ts'

const entrypoint_to_role = {
  app: 'health_worker' as const,
  regulator: 'regulator' as const,
}

export const handler: LoggedInHealthWorkerHandler = {
  async GET(req, ctx) {
    const { role_entrypoint } = ctx.params
    assert(role_entrypoint)
    assertOr404(role_entrypoint in entrypoint_to_role, 'Role not found')
    const role =
      entrypoint_to_role[role_entrypoint as keyof typeof entrypoint_to_role]

    const session_id = cookie.get(req, role)
    if (session_id) {
      await sessions.remove(db, role, {
        session_id,
      })
    }
    const response = redirect('/')
    deleteCookie(response.headers, cookie.sessionKey(role))
    return response
  },
}
