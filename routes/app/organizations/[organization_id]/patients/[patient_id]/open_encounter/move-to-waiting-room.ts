import { z } from 'zod'
import { postHandler } from '../../../../../../../backend/postHandler.ts'
import redirect from '../../../../../../../util/redirect.ts'
import { replaceParams } from '../../../../../../../util/replaceParams.ts'
import { OpenEncounterContext } from './_middleware.tsx'
import { success } from '../../../../../../../util/alerts.ts'
import { preferredName } from '../../../../../../../util/asNames.ts'
import capitalize from '../../../../../../../util/capitalize.ts'
import { waiting_room } from '../../../../../../../db/models/waiting_room.ts'

const MoveToWaitingRoomSchema = z.object({})

export const handler = postHandler(
  MoveToWaitingRoomSchema,
  async (ctx: OpenEncounterContext) => {
    const { trx, organization, organization_employment, encounter } = ctx.state
    await waiting_room.moveTo(trx, { organization, organization_employment, encounter })

    const next_url = success(
      `${capitalize(preferredName(encounter.patient, 'patient'))} has been moved to the waiting room`,
      replaceParams(
        `/app/organizations/:organization_id/waiting_room`,
        ctx.params,
      ),
    )
    return redirect(next_url)
  },
)
