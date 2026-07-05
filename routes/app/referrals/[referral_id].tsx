import { LoggedInHealthWorkerContext } from '../../../types.ts'
import { referrals } from '../../../db/models/referrals.ts'
import { getRequiredUUIDParam } from '../../../util/getParam.ts'
import { json } from '../../../util/responses.ts'

export const handler = {
  GET(ctx: LoggedInHealthWorkerContext) {
    const { trx, health_worker_id } = ctx.state
    const referral_id = getRequiredUUIDParam(ctx, 'referral_id')

    return referrals.getById(trx, referral_id, {
      originator_or_notified_health_worker_id: health_worker_id,
    }).then(json)
  },
}
