import { LoggedInHealthWorkerHandlerWithProps } from '../../../../../../../types.ts'
import { file } from '../../../../../../../util/responses.ts'
import { assert } from 'std/assert/assert.ts'
import * as media from '../../../../../../../db/models/media.ts'

export const handler: LoggedInHealthWorkerHandlerWithProps = {
  async GET(_, ctx) {
    const { media_id } = ctx.params

    // TODO possibly add assertion here ensuring the media belongs to the nurse.
    const health_worker_media = await media.get(ctx.state.trx, { media_id })

    return file(health_worker_media.binary_data, health_worker_media.mime_type)
  },
}
