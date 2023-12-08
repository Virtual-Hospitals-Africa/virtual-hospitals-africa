import { LoggedInHealthWorkerHandler } from '../../../../../../types.ts'
import { file } from '../../../../../../util/responses.ts'
import { isHealthWorkerWithGoogleTokens } from '../../../../../../db/models/health_workers.ts'
import { assert } from '$std/assert/assert.ts'
import * as media from '../../../../../../db/models/media.ts'

export const handler: LoggedInHealthWorkerHandler = {
  async GET(_, ctx) {
    console.log('get appointment media called')
    const appointment_id = parseInt(ctx.params.appointmentId)
    assert(appointment_id)

    const media_id = parseInt(ctx.params.mediaId)
    assert(media_id)

    const { healthWorker } = ctx.state

    const appointment_media = await media.get(ctx.state.trx, {
      media_id,
      appointment_id,
    })

    const mediaData = appointment_media.binary_data
    return file(mediaData, appointment_media.mime_type)
  },
}
