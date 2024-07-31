import { LoggedInHealthWorkerHandlerWithProps } from '../../../../../../types.ts'
import { file } from '../../../../../../util/responses.ts'
import * as media from '../../../../../../db/models/media.ts'

export const handler: LoggedInHealthWorkerHandlerWithProps = {
  async GET(_, ctx) {
    const { appointment_id, media_id } = ctx.params

    const appointment_media = await media.get(ctx.state.trx, {
      media_id,
      appointment_id,
    })

    const mediaData = appointment_media.binary_data
    return file(mediaData, appointment_media.mime_type)
  },
}
