import * as media from '../../../db/models/media.ts'

import { file } from '../../../util/responses.ts'
import { assertOr404 } from '../../../util/assertOr.ts'
import { LoggedInHealthWorkerContext } from '../../../types.ts'

// TODO: consider whether your having a media's UUID is sufficient guarantee that you have authorization to see it
export const handler = {
  async GET({ state, params }: LoggedInHealthWorkerContext) {
    const requested_media = await media.getById(state.trx, params.uuid)
    assertOr404(requested_media, 'Could not find file')
    return file(requested_media.binary_data, requested_media.mime_type)
  },
}
