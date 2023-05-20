import { MiddlewareHandlerContext } from '$fresh/server.ts'
import { WithSession } from 'fresh_session'
import redirect from '../../util/redirect.ts'
import { isDoctorWithGoogleTokens } from '../../db/models/doctors.ts'
import { TrxOrDb } from '../../types.ts'
import db from '../../db/db.ts'

// Ensure user is a doctor who has session with google tokens
export const handler = [
  (
    _req: Request,
    ctx: MiddlewareHandlerContext<
      WithSession & {
        trx: TrxOrDb
      }
    >,
  ) => {
    const isAuthedDoctor = isDoctorWithGoogleTokens(ctx.state.session.data)
    if (!isAuthedDoctor) return redirect('/')

    return db.transaction().execute((trx: TrxOrDb) => {
      ctx.state.trx = trx
      return ctx.next()
    })
  },
]
