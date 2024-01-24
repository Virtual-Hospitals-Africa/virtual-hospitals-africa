import * as media from '../../../db/models/media.ts'
import { LoggedInHealthWorkerHandlerWithProps } from '../../../types.ts'
import { file } from '../../../util/responses.ts'
import { assertOr404 } from '../../../util/assertOr.ts'

export const handler: LoggedInHealthWorkerHandlerWithProps = {
  async GET(_, { state, params }) {
    const requested_media = await media.getByUUID(state.trx, params.uuid)
    assertOr404(requested_media, 'Could not find file')
    return file(requested_media.binary_data, requested_media.mime_type)
  },
}
