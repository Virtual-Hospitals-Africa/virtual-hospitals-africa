import { file } from '../../../../../../../util/responses.ts'
import * as media from '../../../../../../../db/models/media.ts'
import { LoggedInHealthWorkerContext } from '../../../../../../../types.ts'

export const handler = {
  async GET(ctx: LoggedInHealthWorkerContext) {
    const { media_id } = ctx.params

    // TODO possibly add assertion here ensuring the media belongs to the nurse.
    const health_worker_media = await media.get(ctx.state.trx, { media_id })

    return file(health_worker_media.binary_data, health_worker_media.mime_type)
  },
}
