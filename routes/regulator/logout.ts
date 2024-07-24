import { deleteCookie } from 'std/http/cookie.ts'
import redirect from '../../util/redirect.ts'
import * as regulators from '../../db/models/regulators.ts'
import { getRegulatorCookie } from './_middleware.ts'
import { LoggedInRegulatorHandler } from '../../types.ts'

export const handler: LoggedInRegulatorHandler = {
  async GET(req, ctx) {
    const regulator_session_id = getRegulatorCookie(req)
    if (regulator_session_id) {
      await regulators.removeSession(ctx.state.trx, {
        regulator_session_id,
      })
    }
    const response = redirect('/')
    deleteCookie(response.headers, 'regulator_session_id')
    return response
  },
}
