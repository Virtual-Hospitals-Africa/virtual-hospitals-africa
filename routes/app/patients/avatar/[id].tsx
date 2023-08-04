import { assert } from 'std/testing/asserts.ts'
import * as media from '../../../../db/models/media.ts'
import { LoggedInHealthWorkerHandler } from '../../../../types.ts'
import { isHealthWorkerWithGoogleTokens } from '../../../../db/models/health_workers.ts'
import { file } from '../../../../util/responses.ts'

export const handler: LoggedInHealthWorkerHandler = {
  async GET(_, ctx) {
    const healthWorker = ctx.state.session.data
    assert(isHealthWorkerWithGoogleTokens(healthWorker))

    const id = parseInt(ctx.params.id)
    assert(id, 'Invalid avatar ID')

    const avatar = await media.get(ctx.state.trx, { media_id: id })

    const avatarData = avatar.binary_data
    return file(avatarData, avatar.mime_type)
  },
}
