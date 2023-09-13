import { LoggedInHealthWorkerHandler } from '../../../../../../types.ts'
import { file } from '../../../../../../util/responses.ts'
import { isHealthWorkerWithGoogleTokens } from '../../../../../../db/models/health_workers.ts'
import { assert } from 'std/testing/asserts.ts'
import * as media from '../../../../../../db/models/media.ts'
import { checkMediaInAppointment } from '../../../../../../db/models/appointments.ts'

export const handler: LoggedInHealthWorkerHandler = {
  async GET(_, ctx) {
    console.log('get appointment media called')
    const appointment_id = parseInt(ctx.params.appointmentId)
    assert(appointment_id)

    const media_id = parseInt(ctx.params.mediaId)
    assert(media_id)

    const healthWorker = ctx.state.session.data
    assert(isHealthWorkerWithGoogleTokens(healthWorker))

    //Check if media is associated with appointment
    const isAppointmentMediaAssociated = await checkMediaInAppointment(
      ctx.state.trx,
      { media_id, appointment_id },
    )
    console.log(isAppointmentMediaAssociated)
    assert(
      isAppointmentMediaAssociated,
      'the media does not associated with this appointment',
    )
    const appointment_media = await media.get(ctx.state.trx, {
      media_id,
    })

    const mediaData = appointment_media.binary_data
    return file(mediaData, appointment_media.mime_type)
  },
}
