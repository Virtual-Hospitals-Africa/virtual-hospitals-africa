import * as patients from '../../../../db/models/patients.ts'
import { LoggedInHealthWorkerHandler } from '../../../../types.ts'
import { file } from '../../../../util/responses.ts'
import { assertOr404 } from '../../../../util/assertOr.ts'

export const handler: LoggedInHealthWorkerHandler = {
  async GET(_, ctx) {
    const patient_id = parseInt(ctx.params.patient_id)
    assertOr404(patient_id, 'Invalid patient ID')

    // TODO: check if the health worker has access as part of the media query below
    const avatar = await patients.getAvatar(ctx.state.trx, { patient_id })
    assertOr404(avatar)

    return file(avatar.binary_data, avatar.mime_type)
  },
}
