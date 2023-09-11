import { LoggedInHealthWorkerHandler } from '../../../../types.ts'
import { file } from '../../../../util/responses.ts'
import { isHealthWorkerWithGoogleTokens } from '../../../../db/models/health_workers.ts'
import { assert } from 'std/testing/asserts.ts'
import * as media from '../../../../db/models/media.ts'
import { mediaTypeToLoader } from 'https://deno.land/x/esbuild_deno_loader@0.7.0/src/shared.ts'

type MediaItemProp = {
  binary_data: BinaryData
  mime_type: string
}

export const handler: LoggedInHealthWorkerHandler = {
  async GET(_, ctx) {
    const healthWorker = ctx.state.session.data
    assert(isHealthWorkerWithGoogleTokens(healthWorker))

    const id = parseInt(ctx.params.id)
    assert(id, 'Invalid media ID, id is probably not int')

    const appointment_media = await media.get(ctx.state.trx, { media_id: id })

    const mediaData = appointment_media.binary_data
    return file(mediaData, appointment_media.mime_type)
  },
}
