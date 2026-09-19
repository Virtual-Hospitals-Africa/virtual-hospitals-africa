import { assert } from 'std/assert/assert.ts'
import { postHandler } from '../../../../../../../backend/postHandler.ts'
import type { OpenEncounterContext } from '../../../../../../../types.ts'
import { referrals } from '../../../../../../../db/models/referrals.ts'
import { type ReferPostResponse, ReferSchema } from '../../../../../../../shared/refer_post.ts'
import { json } from '../../../../../../../util/responses.ts'

export const handler = postHandler(
  ReferSchema,
  async (ctx: OpenEncounterContext, body) => {
    assert(body.type === 'colleague', 'Referring to the nearest hospital is not yet implemented')

    const { trx, patient_id, patient_encounter_id, organization_id, employment_id, health_worker_id, health_worker } = ctx.state

    const { referral_id } = await referrals.insert(trx, {
      patient_id,
      patient_encounter_id,
      organization_id,
      employment_id,
      originator_health_worker_id: health_worker_id,
      originator_avatar_url: health_worker.avatar_url!,
      health_worker_ids_to_be_notified: body.health_worker_ids_to_be_notified,
    })

    const referral = await referrals.getById(trx, referral_id, {
      originator_health_worker_id: health_worker_id,
    })

    const response: ReferPostResponse = {
      referral_id,
      recipients: referral.recipients,
    }

    return json(response)
  },
)
