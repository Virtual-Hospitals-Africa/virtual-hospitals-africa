import * as health_workers from '../../../../db/models/health_workers.ts'

import { file } from '../../../../util/responses.ts'
import { assertOr404 } from '../../../../util/assertOr.ts'
import { getRequiredUUIDParam } from '../../../../util/getParam.ts'
import { LoggedInHealthWorkerContext } from '../../../../types.ts'

export const handler = {
  async GET(ctx: LoggedInHealthWorkerContext) {
    const health_worker_id = getRequiredUUIDParam(ctx, 'health_worker_id')

    const avatar = await health_workers.getAvatar(ctx.state.trx, {
      health_worker_id,
    })
    assertOr404(avatar)

    return file(avatar.binary_data, avatar.mime_type)
  },
}
