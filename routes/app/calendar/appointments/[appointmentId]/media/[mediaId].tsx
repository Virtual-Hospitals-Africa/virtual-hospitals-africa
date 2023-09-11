import { LoggedInHealthWorkerHandler } from '../../../../../../types.ts'
import { file } from '../../../../../../util/responses.ts'
import { isHealthWorkerWithGoogleTokens } from '../../../../../../db/models/health_workers.ts'
import { assert } from 'std/testing/asserts.ts'
import * as media from '../../../../../../db/models/media.ts'

export const handler: LoggedInHealthWorkerHandler = {
  async GET(_, ctx) {
    const appointmentId = parseInt(ctx.params.appointmentId)
    assert(appointmentId)

    const mediaId = parseInt(ctx.params.mediaId)
    assert(mediaId)

    const healthWorker = ctx.state.session.data
    assert(isHealthWorkerWithGoogleTokens(healthWorker))

    // TODO: Check if media is associated with appointment
    const appointment_media = await media.get(ctx.state.trx, {
      media_id: mediaId,
    })

    const mediaData = appointment_media.binary_data
    return file(mediaData, appointment_media.mime_type)
  },
}
