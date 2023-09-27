import { assert } from 'std/assert/assert.ts'
import * as patients from '../../../../db/models/patients.ts'
import * as media from '../../../../db/models/media.ts'
import { LoggedInHealthWorkerHandler } from '../../../../types.ts'
import { file } from '../../../../util/responses.ts'

export const handler: LoggedInHealthWorkerHandler = {
  async GET(_, ctx) {
    const healthWorker = ctx.state.healthWorker
    const id = parseInt(ctx.params.id)
    assert(!isNaN(id), 'Invalid patient ID')

    // TODO: not get the whole patient, just check if the health worker has access as part of the media query below
    const [patient] = await patients.getWithMedicalRecords(ctx.state.trx, {
      ids: [id],
      health_worker_id: healthWorker.id,
    })

    assert(patient, 'Patient not found')

    assert(patient.avatar_media_id, 'Patient has no avatar')

    const avatar = await media.get(ctx.state.trx, {
      media_id: patient.avatar_media_id,
    })

    const avatarData = avatar.binary_data
    return file(avatarData, avatar.mime_type)
  },
}
