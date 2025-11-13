import { Context } from 'fresh'
import * as health_workers from '../../../db/models/health_workers.ts'
import { file } from '../../../util/responses.ts'
import { getRequiredUUIDParam } from '../../../util/getParam.ts'
import { assertOr404 } from '../../../util/assertOr.ts'
import db from '../../../db/db.ts'

export const handler = {
  async GET(ctx: Context<unknown>) {
    const health_worker_id = getRequiredUUIDParam(ctx, 'health_worker_id')

    const avatar = await health_workers.getAvatar(db, {
      health_worker_id,
    })
    assertOr404(avatar)

    return file(avatar.binary_data, avatar.mime_type)
  },
}
