import { patients } from '../../../../db/models/patients.ts'

import { file } from '../../../../util/responses.ts'
import { assertOr404 } from '../../../../util/assertOr.ts'
import { getRequiredUUIDParam } from '../../../../util/getParam.ts'
import { LoggedInHealthWorkerContext } from '../../../../types.ts'

export const handler = {
  async GET(ctx: LoggedInHealthWorkerContext) {
    const patient_id = getRequiredUUIDParam(ctx, 'patient_id')

    // TODO: check if the health worker has access as part of the media query below
    const avatar = await patients.getAvatar(ctx.state.trx, { patient_id })
    assertOr404(avatar)

    return file(avatar.binary_data, avatar.mime_type)
  },
}
