import { LoggedInHealthWorkerHandler } from '../../../../../../../types.ts'
import { file } from '../../../../../../../util/responses.ts'
import { assert } from 'std/assert/assert.ts'
import * as media from '../../../../../../../db/models/media.ts'

export const handler: LoggedInHealthWorkerHandler = {
  async GET(_, ctx) {
    const media_id = parseInt(ctx.params.mediaId)
    assert(media_id)

    // possibly add assertion here ensuring the media belongs to the nurse.
    const health_worker_media = await media.get(ctx.state.trx, { media_id })

    return file(health_worker_media.binary_data, health_worker_media.mime_type)
  },
}
