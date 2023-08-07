import { redisSession } from 'fresh_session'
import { MiddlewareHandlerContext } from '$fresh/server.ts'
import { WithSession } from 'fresh_session'
import { TrxOrDb } from "../../types.ts";
import * as employment from "../../db/models/employment.ts"
import * as details from "../../db/models/nurse_registration_details.ts"
import { isHealthWorkerWithGoogleTokens } from '../../db/models/health_workers.ts';
import { assert } from 'std/testing/asserts.ts'
import redirect from '../../util/redirect.ts';

export const handler = [
  async (
    req: Request,
    ctx: MiddlewareHandlerContext<
      WithSession & {
        trx: TrxOrDb
      }
    >,
  ) => {
    const { trx } = ctx.state
    const healthWorker = ctx.state.session.data
    assert(isHealthWorkerWithGoogleTokens(healthWorker))

    const employmentDetails = await employment.getByHealthWorker(trx, {health_worker_id: healthWorker.id})
    const nurseDetails = await details.getDetails(trx, {healthWorkerId: healthWorker.id})

    if (ctx.state.session.get('isRegistering')) return ctx.next()

    if (!nurseDetails) {
        if (employmentDetails?.at(0)) {
            ctx.state.session.set('isRegistering',true)
            console.log(`/app/facilities/${employmentDetails.at(0)?.facility_id}/register`)
            return redirect(`/app/facilities/${employmentDetails.at(0)?.facility_id}/register`)
        }
        return new Response('Not authorized', { status: 401 })
    }

    if (!nurseDetails.approved_by) {
      return new Response('Please wait unitl details approved by admin', { status: 401 })
    }

    return ctx.next()
  },
]
